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
    const { project_name, industry, description, project_data } = projectData;

    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Insert project
      const projectResult = await query(
        `INSERT INTO projects (user_id, project_name, industry, description, status, submitted_at)
         VALUES ($1, $2, $3, $4, 'PENDING', CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, project_name, industry, description || null]
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
        e.recommendations,
        e.strengths,
        e.risks,
        e.overall_score,
        e.status as evaluation_status
       FROM projects p
       LEFT JOIN evaluations e ON p.project_id = e.project_id
       WHERE p.user_id = $1
       ORDER BY p.submitted_at DESC`,
      [userId]
    );

    const projects = result.rows.map(row => ({
      project_id: row.project_id,
      project_name: row.project_name,
      submitted_at: row.submitted_at,
      industry: row.industry,
      status: row.status,
      description: row.description,
      user_id: row.user_id,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        recommendations: row.recommendations,
        strengths: row.strengths,
        risks: row.risks,
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
        e.recommendations,
        e.strengths,
        e.risks,
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
       JOIN key_issues ki ON pd.issue_id = ki.issue_id
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
      status: row.status,
      description: row.description,
      user_id: row.user_id,
      project_data: projectDataResult.rows,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        recommendations: row.recommendations,
        strengths: row.strengths,
        risks: row.risks,
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
       FROM key_issues ki
       JOIN msci_standards ms ON ki.standard_id = ms.standard_id
       ORDER BY ki.pillar, ki.issue_id`
    );
    return result.rows;
  }

  // Mock ESG evaluation function
  static async triggerEvaluation(projectId: number): Promise<void> {
    try {
      await this.updateProjectStatus(projectId, 'PROCESSING');

      setTimeout(async () => {
        try {
          // Get project data for calculation
          const projectDataResult = await query(
            `SELECT pd.*, ki.pillar, ki.msci_weight
             FROM project_data pd
             JOIN key_issues ki ON pd.issue_id = ki.issue_id
             WHERE pd.project_id = $1`,
            [projectId]
          );

          const projectData = projectDataResult.rows;

          // Calculate scores for each pillar
          const pillarScores = this.calculatePillarScores(projectData);
          const overallScore = this.calculateOverallScore(pillarScores);
          const evaluationStatus = overallScore >= 70 ? 'PASSED' : 'FAILED';

          // Insert evaluation
          const evaluationResult = await query(
            `INSERT INTO evaluations 
             (project_id, recommendations, strengths, risks, overall_score, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING evaluation_id`,
            [
              projectId,
              ['Improve environmental practices', 'Enhance governance transparency'],
              ['Strong social programs', 'Good stakeholder engagement'],
              ['Climate change exposure', 'Regulatory compliance'],
              overallScore,
              evaluationStatus
            ]
          );

          const evaluationId = evaluationResult.rows[0].evaluation_id;

          // Insert pillar scores
          for (const pillarScore of pillarScores) {
            await query(
              `INSERT INTO pillar_scores 
               (pillar_type, score, weight, pass_status, key_count, total_weight, 
                weighted_sum, evaluation_id, standard_id)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                pillarScore.pillar_type,
                pillarScore.score,
                pillarScore.weight,
                pillarScore.pass_status,
                pillarScore.key_count,
                pillarScore.total_weight,
                pillarScore.weighted_sum,
                evaluationId,
                1 // Default standard_id
              ]
            );
          }

          // Update project status
          await this.updateProjectStatus(projectId, 'COMPLETED');

        } catch (error) {
          console.error('Error in mock evaluation:', error);
          await this.updateProjectStatus(projectId, 'COMPLETED'); // Still complete but may have failed evaluation
        }
      }, 5000); // 5 second delay

    } catch (error) {
      console.error('Error triggering evaluation:', error);
      await this.updateProjectStatus(projectId, 'COMPLETED');
    }
  }

  private static calculatePillarScores(projectData: any[]): any[] {
    const pillars = ['E', 'S', 'G'];
    const pillarScores = [];

    for (const pillar of pillars) {
      const pillarData = projectData.filter(data => data.pillar === pillar);
      const totalWeight = pillarData.reduce((sum, data) => sum + data.msci_weight, 0);
      
      // Mock score calculation
      const score = Math.random() * 40 + 60; // 60-100
      const weightedSum = score * totalWeight;
      
      pillarScores.push({
        pillar_type: pillar,
        score: score,
        weight: totalWeight / pillarData.length || 0,
        pass_status: score >= 70,
        key_count: pillarData.length,
        total_weight: totalWeight,
        weighted_sum: weightedSum
      });
    }

    return pillarScores;
  }

  private static calculateOverallScore(pillarScores: any[]): number {
    const totalWeightedSum = pillarScores.reduce((sum, pillar) => sum + pillar.weighted_sum, 0);
    const totalWeight = pillarScores.reduce((sum, pillar) => sum + pillar.total_weight, 0);
    
    return totalWeight > 0 ? totalWeightedSum / totalWeight : 0;
  }
}