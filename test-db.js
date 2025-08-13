const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'zerocall',
      database: 'pms_cloud'
    });
    
    console.log('✅ Database connection successful');
    
    // Create database if it doesn't exist
    await connection.execute('CREATE DATABASE IF NOT EXISTS pms_cloud');
    console.log('✅ Database pms_cloud created/verified');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

testConnection();
