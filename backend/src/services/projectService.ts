import { query } from '../config/database';
import { 
  Project, 
  CreateProjectRequest, 
  ProjectWithEvaluation, 
  ProjectData,
  Evaluation,
  PillarScore
} from '../types/projectType';

export class ProjectService {
  static async createProject(userId: number, projectData: CreateProjectRequest): Promise<Project> {
    const { project_name, industry, annual_revenue, description, project_data } = projectData;

    // Start transaction - แก้ไขการใช้ transaction
    await query('BEGIN');
    
    try {
      // Insert project with annual revenue
      const projectResult = await query(
        `INSERT INTO projects (user_id, project_name, industry, annual_revenue, description, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, project_name, industry, annual_revenue, description || null]
      );

      const project = projectResult.rows[0];
      console.log('Created project:', project); // Debug log

      // Insert project data for each key issue
      if (project_data && project_data.length > 0) {
        for (const data of project_data) {
          console.log(`Inserting project_data: project_id=${project.project_id}, issue_id=${data.issue_id}, value=${data.value}`);
          
          await query(
            `INSERT INTO project_data (project_id, issue_id, value)
             VALUES ($1, $2, $3)`,
            [project.project_id, data.issue_id, data.value]
          );
        }
      }

      await query('COMMIT');
      console.log('Transaction committed successfully');
      return project;

    } catch (error) {
      console.error('Transaction error:', error);
      await query('ROLLBACK');
      throw error;
    }
  }

  static async getProjectsByUser(userId: number): Promise<ProjectWithEvaluation[]> {
    const result = await query(
      `SELECT 
        p.*,
        e.evaluation_id,
        e.overall_score,
        e.status as evaluation_status
       FROM projects p
       LEFT JOIN evaluation e ON p.project_id = e.project_id
       WHERE p.user_id = $1
       ORDER BY p.submitted_at DESC`,
      [userId]
    );

    const projects: ProjectWithEvaluation[] = result.rows.map(row => ({
      project_id: row.project_id,
      project_name: row.project_name,
      submitted_at: row.submitted_at,
      industry: row.industry,
      annual_revenue: row.annual_revenue,
      status: row.status,
      description: row.description,
      user_id: row.user_id,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        overall_score: row.overall_score,
        status: row.evaluation_status,
        project_id: row.project_id,
        pillar_scores: [] // Will be loaded separately if needed
      } : undefined
    }));

    return projects;
  }

  static async getProjectById(projectId: number, userId: number): Promise<ProjectWithEvaluation | null> {
    // Get project with evaluation
    const projectResult = await query(
      `SELECT 
        p.*,
        e.evaluation_id,
        e.overall_score,
        e.status as evaluation_status
       FROM projects p
       LEFT JOIN evaluation e ON p.project_id = e.project_id
       WHERE p.project_id = $1 AND p.user_id = $2`,
      [projectId, userId]
    );

    if (projectResult.rows.length === 0) {
      return null;
    }

    const row = projectResult.rows[0];

    // Get project data
    const projectDataResult = await query(
      `SELECT pd.*, ki.name as issue_name, ki.pillar
       FROM project_data pd
       JOIN key_issue ki ON pd.issue_id = ki.issue_id
       WHERE pd.project_id = $1`,
      [projectId]
    );

    // Get pillar scores if evaluation exists
    let pillarScores: PillarScore[] = [];
    if (row.evaluation_id) {
      const pillarScoresResult = await query(
        `SELECT * FROM pillar_scores WHERE evaluation_id = $1`,
        [row.evaluation_id]
      );
      pillarScores = pillarScoresResult.rows;
    }

    return {
      project_id: row.project_id,
      project_name: row.project_name,
      submitted_at: row.submitted_at,
      industry: row.industry,
      annual_revenue: row.annual_revenue,
      status: row.status,
      description: row.description,
      user_id: row.user_id,
      project_data: projectDataResult.rows,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        overall_score: row.overall_score,
        status: row.evaluation_status,
        project_id: row.project_id,
        pillar_scores: pillarScores
      } : undefined
    };
  }

  static async updateProjectStatus(projectId: number, status: string): Promise<void> {
    await query(
      'UPDATE projects SET status = $1 WHERE project_id = $2',
      [status, projectId]
    );
  }

  static async getKeyIssues(): Promise<any[]> {
    const result = await query(
      `SELECT ki.*, ms.criteria, ms.benchmark 
       FROM key_issue ki
       JOIN msci_standard ms ON ki.standard_id = ms.standard_id
       ORDER BY ki.pillar, ki.issue_id`
    );
    
    // Process the results to extract input types and options from criteria
    return result.rows.map(row => {
      let input_type: 'dropdown' | 'numeric' | 'text' = 'text';
      let dropdown_options: string[] = [];

      // Parse criteria to determine input type and options
      if (row.criteria) {
        const criteria = row.criteria;
        
        // Check if criteria contains dropdown options
        if (criteria.options && Array.isArray(criteria.options)) {
          input_type = 'dropdown';
          dropdown_options = criteria.options;
        } else if (criteria.type === 'numeric' || criteria.input_type === 'numeric') {
          input_type = 'numeric';
        } else if (criteria.type === 'dropdown' || criteria.input_type === 'dropdown') {
          input_type = 'dropdown';
          dropdown_options = criteria.dropdown_options || [];
        }
      }

      return {
        issue_id: row.issue_id,
        name: row.name,
        pillar: row.pillar,
        description: row.description,
        msci_weight: row.msci_weight,
        standard_id: row.standard_id,
        input_type,
        dropdown_options,
        criteria: row.criteria,
        benchmark: row.benchmark
      };
    });
  }

  // Simplified trigger evaluation - no complex calculations
  static async triggerEvaluation(projectId: number): Promise<void> {
    try {
      // Just update the status to indicate evaluation has been triggered
      // But don't actually do any evaluation calculations
      await this.updateProjectStatus(projectId, 'PENDING');
      
      console.log(`Evaluation triggered for project ${projectId} - status remains PENDING`);
    } catch (error) {
      console.error('Error triggering evaluation:', error);
      throw error;
    }
  }

  static async getProjectStats(userId: number): Promise<any> {
    const result = await query(
      `SELECT 
        COUNT(*) as total_projects,
        COUNT(CASE WHEN p.status = 'PENDING' THEN 1 END) as pending_projects,
        COUNT(CASE WHEN p.status = 'PASSED' THEN 1 END) as passed_projects,
        COUNT(CASE WHEN p.status = 'FAILED' THEN 1 END) as failed_projects
       FROM projects p
       WHERE p.user_id = $1`,
      [userId]
    );

    return result.rows[0];
  }

  // เพิ่ม function สำหรับ reset sequence
  static async resetProjectSequence(): Promise<void> {
    try {
      // ใช้ resetAllSequences แทน
      await this.resetAllSequences();
      console.log('All project-related sequences reset successfully');
    } catch (error) {
      console.error('Error resetting project sequences:', error);
      throw error;
    }
  }

  // เพิ่ม function สำหรับตรวจสอบและแก้ไข sequence หาก gap เกินไป
  static async validateAndFixSequence(): Promise<void> {
    try {
      const sequenceResult = await query('SELECT last_value FROM projects_project_id_seq');
      const maxIdResult = await query('SELECT COALESCE(MAX(project_id), 0) as max_id FROM projects');
      
      const currentSequence = parseInt(sequenceResult.rows[0].last_value);
      const maxId = parseInt(maxIdResult.rows[0].max_id);
      
      // หากความต่างมากกว่า 5 ให้ reset sequence
      if (currentSequence - maxId > 5) {
        console.log(`Sequence gap detected: ${currentSequence - maxId}, resetting...`);
        await this.resetProjectSequence();
      }
    } catch (error) {
      console.error('Error validating sequence:', error);
    }
  }

  // เพิ่ม function สำหรับตรวจสอบสถานะ sequence
  static async getSequenceInfo(): Promise<any> {
    try {
      const projectsResult = await query('SELECT last_value FROM projects_project_id_seq');
      const projectsMaxResult = await query('SELECT COALESCE(MAX(project_id), 0) as max_id FROM projects');
      const projectsCountResult = await query('SELECT COUNT(*) as count FROM projects');
      
      const dataResult = await query('SELECT last_value FROM project_data_data_id_seq');
      const dataMaxResult = await query('SELECT COALESCE(MAX(data_id), 0) as max_id FROM project_data');
      const dataCountResult = await query('SELECT COUNT(*) as count FROM project_data');
      
      return {
        projects: {
          current_sequence: parseInt(projectsResult.rows[0].last_value),
          max_project_id: parseInt(projectsMaxResult.rows[0].max_id),
          total_projects: parseInt(projectsCountResult.rows[0].count),
          gap: parseInt(projectsResult.rows[0].last_value) - parseInt(projectsMaxResult.rows[0].max_id)
        },
        project_data: {
          current_sequence: parseInt(dataResult.rows[0].last_value),
          max_data_id: parseInt(dataMaxResult.rows[0].max_id),
          total_data: parseInt(dataCountResult.rows[0].count),
          gap: parseInt(dataResult.rows[0].last_value) - parseInt(dataMaxResult.rows[0].max_id)
        }
      };
    } catch (error) {
      console.error('Error getting sequence info:', error);
      throw error;
    }
  }

  // เพิ่ม function สำหรับ reset ทุก sequence ที่เกี่ยวข้อง
  static async resetAllSequences(): Promise<void> {
    try {
      // Reset projects sequence
      await query(
        `SELECT setval('projects_project_id_seq', COALESCE((SELECT MAX(project_id) FROM projects), 0) + 1, false)`
      );
      
      // Reset project_data sequence  
      await query(
        `SELECT setval('project_data_data_id_seq', COALESCE((SELECT MAX(data_id) FROM project_data), 0) + 1, false)`
      );
      
      // Reset evaluation sequence (ถ้ามี)
      await query(
        `SELECT setval('evaluation_evaluation_id_seq', COALESCE((SELECT MAX(evaluation_id) FROM evaluation), 0) + 1, false)`
      );
      
      // Reset pillar_scores sequence (ถ้ามี) 
      await query(
        `SELECT setval('pillar_scores_score_id_seq', COALESCE((SELECT MAX(score_id) FROM pillar_scores), 0) + 1, false)`
      );
      
      console.log('All sequences reset successfully');
    } catch (error) {
      console.error('Error resetting sequences:', error);
      throw error;
    }
  }

  // เพิ่ม function สำหรับ reset sequence เฉพาะของ project_data
  static async resetProjectDataSequence(): Promise<void> {
    try {
      await query(
        `SELECT setval('project_data_data_id_seq', COALESCE((SELECT MAX(data_id) FROM project_data), 0) + 1, false)`
      );
      console.log('Project data sequence reset successfully');
    } catch (error) {
      console.error('Error resetting project data sequence:', error);
      throw error;
    }
  }
}