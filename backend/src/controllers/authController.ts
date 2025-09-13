import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, RegisterRequest } from '../types/authType';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData: RegisterRequest = req.body;
      
      // Basic validation
      const { firstName, lastName, email, password } = userData;
      if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'All fields are required' 
        });
      }

      if (password.length < 8) {
        return res.status(400).json({ 
          success: false, 
          message: 'Password must be at least 8 characters long' 
        });
      }

      const result = await AuthService.register(userData);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginRequest = req.body;
      
      const { email, password } = credentials;
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email and password are required' 
        });
      }

      const result = await AuthService.login(credentials);
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed'
      });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await AuthService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user_id: user.user_id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }
}