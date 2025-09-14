import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'webdb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Connection pool settings
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection could not be established
});

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL connection error:', err);
  process.exit(-1);
});

// Generic query function with better error handling
export const query = async (text: string, params?: unknown[]): Promise<QueryResult> => {
  const client = await pool.connect();
  try {
    console.log('Executing query:', text);
    if (params) {
      console.log('Parameters:', params);
    }
    
    const result = await client.query(text, params);
    console.log('Query executed successfully, rows affected:', result.rowCount);
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text);
    console.error('Parameters:', params);
    throw error;
  } finally {
    client.release();
  }
};

// Test connection function
export const testConnection = async (): Promise<void> => {
  try {
    const result = await query('SELECT NOW() as current_time');
    console.log('Database connection test successful:', result.rows[0]);
  } catch (error) {
    console.error('Database connection test failed:', error);
    throw error;
  }
};

export default pool;