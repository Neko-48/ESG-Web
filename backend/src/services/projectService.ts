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

    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Insert project with annual revenue
      const projectResult = await query(
        `INSERT INTO projects (user_id, project_name, industry, annual_revenue, description, status, submitted_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, project_name, industry, annual_revenue, description || null]
      );

      const project = projectResult.rows[0];

      // Insert project data for each key issue
      if (project_data && project_data.length > 0) {
        const insertDataPromises = project_data.map(data => 
          query(
            `INSERT INTO project_data (project_id, issue_id, value)
             VALUES ($1, $2, $3)`,
            [project.project_id, data.issue_id, data.value]
          )
        );
        
        await Promise.all(insertDataPromises);
      }

      await query('COMMIT');
      return project;

    } catch (error) {
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
       LEFT JOIN evaluations e ON p.project_id = e.project_id
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
       LEFT JOIN evaluations e ON p.project_id = e.project_id
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

  static async deleteProject(projectId: number, userId: number): Promise<boolean> {
    // Delete related data first (cascade should handle this, but explicit is better)
    await query('DELETE FROM project_data WHERE project_id = $1', [projectId]);
    
    const result = await query(
      'DELETE FROM projects WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    return (result?.rowCount ?? 0) > 0;
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
}