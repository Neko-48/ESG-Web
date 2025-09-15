import { Request, Response } from 'express';
import { ProjectService } from '../services/projectService';
import { CreateProjectRequest } from '../types/projectType';

// Helper function สำหรับจัดการ error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

export class ProjectController {
  static async createProject(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const projectData: CreateProjectRequest = req.body;
      
      console.log('Creating project for user:', userId);
      console.log('Project data:', { ...projectData, project_data: `${projectData.project_data?.length || 0} items` });

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

      // Validate project_data structure
      for (const data of project_data) {
        if (!data.issue_id || data.value === undefined || data.value.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Each project data item must have issue_id and non-empty value'
          });
        }
      }

      // Validate that all issue_ids exist
      const keyIssues = await ProjectService.getKeyIssues();
      const validIssueIds = new Set(keyIssues.map(issue => issue.issue_id));
      
      for (const data of project_data) {
        if (!validIssueIds.has(data.issue_id)) {
          return res.status(400).json({
            success: false,
            message: `Invalid issue_id: ${data.issue_id}`
          });
        }
      }

      const project = await ProjectService.createProject(userId, projectData);
      console.log('Project created successfully:', project.project_id);
      
      // Trigger evaluation (but it won't do any actual calculation)
      await ProjectService.triggerEvaluation(project.project_id);
      
      res.status(201).json({
        success: true,
        message: 'Project created successfully',
        data: project
      });
    } catch (error) {
      console.error('Create project error:', error);
      
      const errorMessage = getErrorMessage(error);
      
      // Check if it's a foreign key constraint error
      if (errorMessage.includes('foreign key constraint')) {
        return res.status(400).json({
          success: false,
          message: 'Invalid reference data provided'
        });
      }
      
      // Check if it's a duplicate key error
      if (errorMessage.includes('duplicate key')) {
        return res.status(409).json({
          success: false,
          message: 'Project already exists'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to create project',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
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

  static async getProjectStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const stats = await ProjectService.getProjectStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get project statistics'
      });
    }
  }

  // เพิ่ม endpoint สำหรับ reset sequence (development only)
  static async resetSequence(req: Request, res: Response) {
    try {
      // ตรวจสอบว่าเป็น development environment
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is only available in development mode'
        });
      }

      await ProjectService.resetAllSequences();
      
      res.status(200).json({
        success: true,
        message: 'All project sequences reset successfully'
      });
    } catch (error) {
      console.error('Reset sequence error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset sequences'
      });
    }
  }

  // เพิ่ม endpoint สำหรับตรวจสอบ sequence
  static async checkSequence(req: Request, res: Response) {
    try {
      const sequenceInfo = await ProjectService.getSequenceInfo();
      
      res.status(200).json({
        success: true,
        data: sequenceInfo
      });
    } catch (error) {
      console.error('Check sequence error:', error);
      const errorMessage = getErrorMessage(error);
      res.status(500).json({
        success: false,
        message: 'Failed to check sequence',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }

  // เพิ่ม endpoint สำหรับ reset ทุก sequence (development only)
  static async resetAllSequences(req: Request, res: Response) {
    try {
      // ตรวจสอบว่าเป็น development environment
      if (process.env.NODE_ENV !== 'development') {
        return res.status(403).json({
          success: false,
          message: 'This endpoint is only available in development mode'
        });
      }

      await ProjectService.resetAllSequences();
      
      res.status(200).json({
        success: true,
        message: 'All sequences reset successfully'
      });
    } catch (error) {
      console.error('Reset all sequences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset sequences'
      });
    }
  }
}