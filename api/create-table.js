import { query } from './db.js';

export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed. Use GET.' 
    });
  }

  try {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        uname VARCHAR(100),
        email VARCHAR(150),
        phone VARCHAR(20),
        password VARCHAR(255)
      )
    `;

    await query(createTableSQL);

    return res.status(200).json({
      success: true,
      message: 'Users table created successfully',
    });
  } catch (error) {
    console.error('[create-table] Error:', error.message);
    console.error('[create-table] Stack:', error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
