import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateProject, handleValidation } from '../middleware/validation';

const router = Router();

// All project routes require authentication
router.use(authMiddleware);

router.post('/', validateProject, handleValidation, ProjectController.createProject);
router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);
router.delete('/:id', ProjectController.deleteProject);

export default router;