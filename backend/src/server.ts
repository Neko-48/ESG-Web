import app from './app';
import { connectDB } from './config/database';

const PORT = process.env.PORT || 3001;

// Connect to database and start server
const startServer = async () => {
  try {
    // Test database connection
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Health Check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nGraceful shutdown initiated...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nGraceful shutdown initiated...');
  process.exit(0);
});

startServer();