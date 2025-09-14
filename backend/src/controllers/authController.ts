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

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid email address' 
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
      
      // Handle specific error messages
      let errorMessage = 'Registration failed';
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(400).json({
        success: false,
        message: errorMessage
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

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid email address' 
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
      
      // Handle specific error messages
      let errorMessage = 'Login failed';
      let statusCode = 401;
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid email or password')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else {
          errorMessage = error.message;
        }
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage
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