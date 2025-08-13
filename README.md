# PMS Cloud Storage System

A comprehensive cloud storage solution similar to Dropbox, built with Next.js and MariaDB. This system provides secure file storage, sharing capabilities, user management, and administrative controls for businesses.

## Features

### 🔐 User Management
- User registration with admin approval system
- Role-based access control (Super Admin, Admin, Employee)
- External user assignment
- User activity tracking and logging

### 📁 File Management
- File and folder upload with drag & drop support
- Multi-file upload capability
- File viewing, editing, and deletion
- Folder organization and navigation
- File type support with MIME type detection

### 🤝 Sharing & Collaboration
- Share files and folders with team members
- External user sharing capabilities
- Customizable permission levels (View, Edit, Full Access)
- Share link generation

### 👑 Admin Panel
- Complete user management system
- System-wide activity monitoring
- User approval and deactivation
- Analytics and reporting
- System settings configuration

### 🔒 Security & Monitoring
- Comprehensive activity logging
- IP address and user agent tracking
- Session management
- Secure file storage
- Password encryption

## Technology Stack

- **Frontend**: Next.js 15 with React 19
- **Backend**: Next.js API Routes
- **Database**: MariaDB with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **File Upload**: Multer & React Dropzone
- **Icons**: Heroicons
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- MariaDB server
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pmcloud
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.example` to `.env.local` and configure:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your settings:
   ```env
   # Database
   DATABASE_URL="mysql://root:zerocall@localhost:3306/pms_cloud"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # File Storage
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=104857600
   
   # Email Configuration
   SMTP_HOST="your-smtp-host"
   SMTP_PORT=587
   SMTP_USER="your-email@domain.com"
   SMTP_PASS="your-email-password"
   FROM_EMAIL="noreply@pmscloud.com"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Seed the database
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## Database Setup

### MariaDB Configuration

1. **Install MariaDB** (if not already installed)
2. **Create database**
   ```sql
   CREATE DATABASE pms_cloud;
   ```
3. **Create user** (optional, can use root)
   ```sql
   CREATE USER 'pmscloud'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON pms_cloud.* TO 'pmscloud'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Initial Admin User

After setting up the database, you'll need to create the first admin user manually in the database or modify the registration process temporarily.

## Project Structure

```
pmcloud/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── providers/         # Context providers
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility libraries
│   └── types/                 # TypeScript type definitions
├── prisma/
│   └── schema.prisma          # Database schema
├── uploads/                   # File upload directory
└── public/                    # Static assets
```

## API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### File Management
- `POST /api/files/upload` - File upload
- `GET /api/files` - List files
- `POST /api/files/[id]/[action]` - File actions (view, share, delete)

### User Management
- `GET /api/users` - List users (admin only)
- `POST /api/users/[id]/activate` - Activate user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

## Usage

### For Employees
1. Register for an account
2. Wait for admin approval
3. Login and start uploading files
4. Organize files in folders
5. Share files with team members

### For Administrators
1. Access admin panel from sidebar
2. Approve/reject user registrations
3. Monitor system activities
4. Manage user permissions
5. Configure system settings

### For Super Administrators
- Full system control
- Access to all files and user data
- System analytics and reporting
- User management capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Security Considerations

- All file uploads are validated and stored securely
- User passwords are hashed using bcryptjs
- Session management handled by NextAuth.js
- Activity logging for audit trails
- Role-based access control implemented
- Input validation and sanitization

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.

---

**PM Cloud** - Secure, scalable, and feature-rich cloud storage for your business needs.
