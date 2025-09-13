import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRegistration, validateLogin, handleValidation } from '../middleware/validation';

const router = Router();

// Public routes
router.post('/register', validateRegistration, handleValidation, AuthController.register);
router.post('/login', validateLogin, handleValidation, AuthController.login);

// Protected routes
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;