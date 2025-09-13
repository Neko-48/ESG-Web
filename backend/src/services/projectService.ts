import { query } from '../config/database';
import { Project, CreateProjectRequest, ProjectWithEvaluation } from '../types/projectType';

export class ProjectService {
  static async createProject(userId: number, projectData: CreateProjectRequest): Promise<Project> {
    const { project_name, industry, environmental_data, social_data, governance_data } = projectData;

    const result = await query(
      `INSERT INTO projects (user_id, project_name, industry, environmental_data, social_data, governance_data, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
       RETURNING *`,
      [userId, project_name, industry, environmental_data, social_data, governance_data]
    );

    return result.rows[0];
  }

  static async getProjectsByUser(userId: number): Promise<ProjectWithEvaluation[]> {
    const result = await query(
      `SELECT 
        p.*,
        pe.evaluation_id,
        pe.environmental_score,
        pe.social_score,
        pe.governance_score,
        pe.overall_score,
        pe.pass_fail,
        pe.recommendations,
        pe.strengths,
        pe.risks,
        pe.created_at as evaluation_created_at
       FROM projects p
       LEFT JOIN project_evaluations pe ON p.project_id = pe.project_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      project_id: row.project_id,
      user_id: row.user_id,
      project_name: row.project_name,
      industry: row.industry,
      environmental_data: row.environmental_data,
      social_data: row.social_data,
      governance_data: row.governance_data,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        project_id: row.project_id,
        environmental_score: row.environmental_score,
        social_score: row.social_score,
        governance_score: row.governance_score,
        overall_score: row.overall_score,
        pass_fail: row.pass_fail,
        recommendations: row.recommendations,
        strengths: row.strengths,
        risks: row.risks,
        created_at: row.evaluation_created_at
      } : undefined
    }));
  }

  static async getProjectById(projectId: number, userId: number): Promise<ProjectWithEvaluation | null> {
    const result = await query(
      `SELECT 
        p.*,
        pe.evaluation_id,
        pe.environmental_score,
        pe.social_score,
        pe.governance_score,
        pe.overall_score,
        pe.pass_fail,
        pe.recommendations,
        pe.strengths,
        pe.risks,
        pe.created_at as evaluation_created_at
       FROM projects p
       LEFT JOIN project_evaluations pe ON p.project_id = pe.project_id
       WHERE p.project_id = $1 AND p.user_id = $2`,
      [projectId, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      project_id: row.project_id,
      user_id: row.user_id,
      project_name: row.project_name,
      industry: row.industry,
      environmental_data: row.environmental_data,
      social_data: row.social_data,
      governance_data: row.governance_data,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      evaluation: row.evaluation_id ? {
        evaluation_id: row.evaluation_id,
        project_id: row.project_id,
        environmental_score: row.environmental_score,
        social_score: row.social_score,
        governance_score: row.governance_score,
        overall_score: row.overall_score,
        pass_fail: row.pass_fail,
        recommendations: row.recommendations,
        strengths: row.strengths,
        risks: row.risks,
        created_at: row.evaluation_created_at
      } : undefined
    };
  }

  static async updateProjectStatus(projectId: number, status: string): Promise<void> {
    await query(
      'UPDATE projects SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE project_id = $2',
      [status, projectId]
    );
  }

  static async deleteProject(projectId: number, userId: number): Promise<boolean> {
    const result = await query(
      'DELETE FROM projects WHERE project_id = $1 AND user_id = $2',
      [projectId, userId]
    );

    return (result?.rowCount ?? 0) > 0;
  }

  // Mock ESG evaluation function (จะใช้งานจริงเมื่อมี RAG Engine)
  static async triggerEvaluation(projectId: number): Promise<void> {
    try {
      // Update status to processing
      await this.updateProjectStatus(projectId, 'PROCESSING');

      // Simulate processing time
      setTimeout(async () => {
        try {
          // Mock evaluation results
          const mockEvaluation = {
            environmental_score: Math.random() * 40 + 60, // 60-100
            social_score: Math.random() * 40 + 60,
            governance_score: Math.random() * 40 + 60,
          };

          const overall_score = (mockEvaluation.environmental_score + mockEvaluation.social_score + mockEvaluation.governance_score) / 3;
          const pass_fail = overall_score >= 70 ? 'PASS' : 'FAIL';

          // Insert evaluation results
          await query(
            `INSERT INTO project_evaluations 
             (project_id, environmental_score, social_score, governance_score, overall_score, pass_fail, recommendations, strengths, risks)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              projectId,
              mockEvaluation.environmental_score,
              mockEvaluation.social_score,
              mockEvaluation.governance_score,
              overall_score,
              pass_fail,
              'Mock recommendations from ESG evaluation',
              'Mock strengths identified',
              'Mock risks identified'
            ]
          );

          // Update project status to completed
          await this.updateProjectStatus(projectId, 'COMPLETED');
        } catch (error) {
          console.error('Error in mock evaluation:', error);
          await this.updateProjectStatus(projectId, 'FAILED');
        }
      }, 3000); // 3 second delay to simulate processing
    } catch (error) {
      console.error('Error triggering evaluation:', error);
      await this.updateProjectStatus(projectId, 'FAILED');
    }
  }
}