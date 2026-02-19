import { query } from './db.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Test database connection
    const [rows] = await query('SELECT 1 as test');
    
    return res.status(200).json({
      success: true,
      message: 'API is working',
      database: 'Connected',
      test: rows,
      env: {
        hasDB_HOST: !!process.env.DB_HOST,
        hasDB_PORT: !!process.env.DB_PORT,
        hasDB_USER: !!process.env.DB_USER,
        hasDB_PASSWORD: !!process.env.DB_PASSWORD,
        hasDB_NAME: !!process.env.DB_NAME,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message,
      env: {
        hasDB_HOST: !!process.env.DB_HOST,
        hasDB_PORT: !!process.env.DB_PORT,
        hasDB_USER: !!process.env.DB_USER,
        hasDB_PASSWORD: !!process.env.DB_PASSWORD,
        hasDB_NAME: !!process.env.DB_NAME,
      },
    });
  }
}
