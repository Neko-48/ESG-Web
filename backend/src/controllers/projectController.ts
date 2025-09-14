import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { CreateProjectRequest } from '../types/projectType';

export class ProjectController {
  static async createProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const projectData: CreateProjectRequest = req.body;
      
      // Basic validation
      const { project_name, industry, project_data } = projectData;
      if (!project_name || !industry) {
        return res.status(400).json({ 
          success: false, 
          message: 'Project name and industry are required' 
        });
      }

      if (!project_data || project_data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Project data is required'
        });
      }

      const project = await ProjectService.createProject(userId, projectData);
      
      // Trigger ESG evaluation asynchronously
      ProjectService.triggerEvaluation(project.project_id);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create project'
      });
    }
  }

  static async getProjects(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const projects = await ProjectService.getProjectsByUser(userId);
      
      res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get projects'
      });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const project = await ProjectService.getProjectById(projectId, userId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project'
      });
    }
  }

  static async deleteProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid project ID'
        });
      }

      const deleted = await ProjectService.deleteProject(projectId, userId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Project not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete project'
      });
    }
  }

  static async getKeyIssues(req: Request, res: Response) {
    try {
      const keyIssues = await ProjectService.getKeyIssues();
      
      res.status(200).json({
        success: true,
        data: keyIssues
      });
    } catch (error) {
      console.error('Get key issues error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get key issues'
      });
    }
  }
}