import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute';
import { testConnection } from './config/database';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', { ...req.body, password: req.body.password ? '***' : undefined });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await testConnection();
    res.status(200).json({
      success: true,
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
        DB_NAME: process.env.DB_NAME,
        DB_HOST: process.env.DB_HOST,
        DB_PORT: process.env.DB_PORT,
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use((error: Error, req: Request, res: Response, next: any) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const startServer = async (): Promise<void> => {
  try {
    console.log('Starting server...');
    console.log('Environment variables:');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_PORT:', process.env.DB_PORT);
    console.log('DB_NAME:', process.env.DB_NAME);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? '***set***' : 'NOT SET');
    
    await testConnection();
    console.log('Database connection successful!');
    
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`API Health Check: http://localhost:${port}/api/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
export default app;
