const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function setupDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'zerocall',
    database: 'pms_cloud'
  });

  try {
    console.log('🔄 Setting up database tables...');

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(30) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('SUPER_ADMIN', 'ADMIN', 'EMPLOYEE') DEFAULT 'EMPLOYEE',
        isActive BOOLEAN DEFAULT FALSE,
        isExternal BOOLEAN DEFAULT FALSE,
        avatar VARCHAR(255),
        invitedById VARCHAR(30),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      )
    `);

    // Create files table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(30) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        size INT NOT NULL,
        mimeType VARCHAR(255) NOT NULL,
        path VARCHAR(500) NOT NULL,
        isFolder BOOLEAN DEFAULT FALSE,
        parentId VARCHAR(30),
        ownerId VARCHAR(30) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parentId) REFERENCES files(id),
        INDEX idx_owner (ownerId),
        INDEX idx_parent (parentId)
      )
    `);

    // Create file_shares table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS file_shares (
        id VARCHAR(30) PRIMARY KEY,
        fileId VARCHAR(30) NOT NULL,
        userId VARCHAR(30) NOT NULL,
        permission ENUM('VIEW', 'EDIT', 'FULL_ACCESS') DEFAULT 'VIEW',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_file_user (fileId, userId),
        FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(30) PRIMARY KEY,
        userId VARCHAR(30) NOT NULL,
        fileId VARCHAR(30),
        action ENUM('LOGIN', 'LOGOUT', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'FILE_DELETE', 'FILE_SHARE', 'FILE_EDIT', 'FOLDER_CREATE', 'USER_INVITE', 'PASSWORD_CHANGE') NOT NULL,
        details TEXT,
        ipAddress VARCHAR(45),
        userAgent TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE SET NULL,
        INDEX idx_user (userId),
        INDEX idx_action (action),
        INDEX idx_created (createdAt)
      )
    `);

    // Create notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(30) PRIMARY KEY,
        userId VARCHAR(30) NOT NULL,
        type ENUM('FILE_SHARED', 'FILE_UPLOADED', 'USER_INVITED', 'SYSTEM_ALERT') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        isRead BOOLEAN DEFAULT FALSE,
        data JSON,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user (userId),
        INDEX idx_read (isRead)
      )
    `);

    console.log('✅ Database tables created successfully');

    // Create super admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminId = 'admin_' + Date.now();
    
    await connection.execute(`
      INSERT IGNORE INTO users (id, email, name, password, role, isActive, isExternal) 
      VALUES (?, ?, ?, ?, 'SUPER_ADMIN', TRUE, FALSE)
    `, [adminId, 'admin@pmscloud.com', 'Super Admin', hashedPassword]);

    console.log('✅ Super admin user created');
    console.log('📧 Email: admin@pmscloud.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
