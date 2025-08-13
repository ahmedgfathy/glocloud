<!-- Banner with Logo -->
<div align="center">
  <img src="https://github.com/ahmedgfathy/pmcloud/raw/main/public/logo.svg" alt="PM Cloud Logo" width="120" height="120">
  
  # 🚀 PM Cloud - Enterprise File Management System
  
  <p align="center">
    <b>🌟 The Ultimate Cloud Storage Solution for Modern Businesses 🌟</b>
  </p>
  
  <p align="center">
    A comprehensive, secure, and scalable cloud storage platform built with Next.js and MariaDB
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js">
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
    <img src="https://img.shields.io/badge/MariaDB-Latest-brown?style=for-the-badge&logo=mariadb" alt="MariaDB">
    <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma" alt="Prisma">
    <img src="https://img.shields.io/badge/TailwindCSS-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
  </p>

  <p align="center">
    <img src="https://img.shields.io/github/license/ahmedgfathy/pmcloud?style=for-the-badge" alt="License">
    <img src="https://img.shields.io/github/stars/ahmedgfathy/pmcloud?style=for-the-badge" alt="Stars">
    <img src="https://img.shields.io/github/forks/ahmedgfathy/pmcloud?style=for-the-badge" alt="Forks">
  </p>
</div>

---

## ✨ Key Features

<table>
  <tr>
    <td align="center" width="50%">
      <h3>🔐 User Management</h3>
      <ul align="left">
        <li>🎯 Role-based access control (Super Admin, Admin, Employee)</li>
        <li>👥 User registration with admin approval</li>
        <li>🌐 External user assignment</li>
        <li>📊 User activity tracking and logging</li>
        <li>🛡️ Secure authentication with NextAuth.js</li>
      </ul>
    </td>
    <td align="center" width="50%">
      <h3>📁 File Management</h3>
      <ul align="left">
        <li>📤 Drag & drop file/folder upload</li>
        <li>📚 Multi-file upload capability</li>
        <li>👁️ File viewing, editing, and deletion</li>
        <li>🗂️ Folder organization and navigation</li>
        <li>🔍 MIME type detection and validation</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <h3>🤝 Sharing & Collaboration</h3>
      <ul align="left">
        <li>🔗 Share files and folders with team members</li>
        <li>🌍 External user sharing capabilities</li>
        <li>🔒 Customizable permission levels (View, Edit, Full Access)</li>
        <li>📎 Share link generation</li>
        <li>📨 Email notifications for shared content</li>
      </ul>
    </td>
    <td align="center" width="50%">
      <h3>👑 Admin Panel</h3>
      <ul align="left">
        <li>🎛️ Complete user management system</li>
        <li>📈 System-wide activity monitoring</li>
        <li>✅ User approval and deactivation</li>
        <li>📊 Analytics and reporting</li>
        <li>⚙️ System settings configuration</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td align="center" colspan="2">
      <h3>🎨 Customizable Branding & 🔒 Security</h3>
      <ul align="left">
        <li>🏢 <b>Company Branding:</b> Custom logo, company name, and color themes</li>
        <li>⚙️ <b>Environment-based Setup:</b> Easy super admin configuration via .env</li>
        <li>🛡️ <b>Security:</b> Comprehensive activity logging, IP tracking, session management</li>
        <li>🔐 <b>Data Protection:</b> Secure file storage and password encryption</li>
        <li>📝 <b>Audit Trail:</b> Full user action tracking with timestamps</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Technology Stack

<div align="center">
  <table>
    <tr>
      <td align="center"><strong>🎨 Frontend</strong></td>
      <td>Next.js 15 • React 19 • TypeScript • Tailwind CSS</td>
    </tr>
    <tr>
      <td align="center"><strong>⚡ Backend</strong></td>
      <td>Next.js API Routes • NextAuth.js • Prisma ORM</td>
    </tr>
    <tr>
      <td align="center"><strong>💾 Database</strong></td>
      <td>MariaDB / MySQL</td>
    </tr>
    <tr>
      <td align="center"><strong>📤 File Upload</strong></td>
      <td>Multer • React Dropzone</td>
    </tr>
    <tr>
      <td align="center"><strong>🎯 UI/UX</strong></td>
      <td>Heroicons • Responsive Design • Modern Gradients</td>
    </tr>
  </table>
</div>

---

## 🚀 Quick Start Guide

### 📋 Prerequisites

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js" alt="Node.js">
        <br><strong>Node.js 18+</strong>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/MariaDB-10.6+-brown?style=for-the-badge&logo=mariadb" alt="MariaDB">
        <br><strong>MariaDB/MySQL</strong>
      </td>
      <td align="center">
        <img src="https://img.shields.io/badge/npm-8+-red?style=for-the-badge&logo=npm" alt="npm">
        <br><strong>npm/yarn</strong>
      </td>
    </tr>
  </table>
</div>

### 🔧 Installation

1. **📥 Clone the repository**
   ```bash
   git clone https://github.com/ahmedgfathy/pmcloud.git
   cd pmcloud
   ```

2. **📦 Install dependencies**
   ```bash
   npm install
   ```

3. **⚙️ Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Database Configuration
   DATABASE_URL="mysql://root:password@localhost:3306/pm_cloud"
   
   # NextAuth Configuration
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-key-here"
   
   # 👑 Super Admin Setup (First-time configuration)
   SUPER_ADMIN_EMAIL="admin@yourcompany.com"
   SUPER_ADMIN_PASSWORD="your-secure-admin-password"
   SUPER_ADMIN_NAME="Super Administrator"
   
   # File Upload Settings
   UPLOAD_DIR="./uploads"
   MAX_FILE_SIZE=104857600
   
   # 📧 Email Configuration (Optional)
   SMTP_HOST="your-smtp-host"
   SMTP_PORT=587
   SMTP_USER="your-email@domain.com"
   SMTP_PASS="your-email-password"
   FROM_EMAIL="noreply@yourcompany.com"
   ```

4. **🗄️ Set up the database**
   ```bash
   # Create database schema
   npm run db:push
   
   # Generate Prisma client
   npm run db:generate
   ```

5. **👑 Initialize the application**
   ```bash
   # This creates the super admin and default settings
   npm run setup
   ```

6. **🚀 Start the development server**
   ```bash
   npm run dev
   ```

7. **🌐 Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎨 Customization Guide

### 🏢 Company Branding Setup

PM Cloud supports full company branding customization:

1. **🔑 Login as Super Admin** using the credentials from your `.env` file
2. **⚙️ Navigate to Admin → Company Settings**
3. **🎨 Customize your branding:**
   - 🏢 Company name and logo
   - 🎨 Primary and secondary colors
   - 📧 Contact information
   - 🌐 Company website and description

<div align="center">
  <img src="https://via.placeholder.com/800x400/2563eb/ffffff?text=Company+Settings+Screenshot" alt="Company Settings" style="border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
</div>

### 👑 Super Admin Configuration

The super admin is automatically created from environment variables:

```env
SUPER_ADMIN_EMAIL="ceo@yourcompany.com"
SUPER_ADMIN_PASSWORD="SecurePassword123!"
SUPER_ADMIN_NAME="CEO Full Name"
```

**🔄 Run the setup again** if you need to create additional super admins or reset the configuration.

---

## 📁 Project Structure

```
pmcloud/
├── 🎨 src/
│   ├── 📱 app/                     # Next.js App Router pages
│   │   ├── 🔌 api/                # API routes
│   │   │   ├── 🔐 auth/           # Authentication endpoints
│   │   │   ├── 📁 files/          # File management APIs
│   │   │   ├── 👥 users/          # User management APIs
│   │   │   └── 👑 admin/          # Admin panel APIs
│   │   ├── 🔐 auth/               # Authentication pages
│   │   ├── 📊 dashboard/          # Main application dashboard
│   │   ├── 👑 admin/              # Admin panel pages
│   │   └── 🎭 providers/          # Context providers
│   ├── 🧩 components/             # Reusable UI components
│   ├── 📚 lib/                    # Utility libraries
│   └── 🔗 types/                  # TypeScript definitions
├── 🗄️ prisma/
│   └── schema.prisma              # Database schema
├── 📤 uploads/                    # File storage directory
├── 🌐 public/                     # Static assets
├── ⚙️ setup-app.js                # Application setup script
└── 📋 package.json                # Dependencies and scripts
```

---

## 🚀 API Reference

<details>
<summary><strong>🔐 Authentication APIs</strong></summary>

- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication
- `GET /api/auth/session` - Get current session

</details>

<details>
<summary><strong>📁 File Management APIs</strong></summary>

- `POST /api/files/upload` - Upload files
- `GET /api/files` - List user files
- `GET /api/files/[id]/download` - Download file
- `POST /api/files/[id]/share` - Share file
- `DELETE /api/files/[id]` - Delete file

</details>

<details>
<summary><strong>👥 User Management APIs</strong></summary>

- `GET /api/users` - List users (admin only)
- `POST /api/users/[id]/activate` - Activate user
- `DELETE /api/users/[id]` - Delete user
- `PUT /api/users/[id]` - Update user

</details>

<details>
<summary><strong>👑 Admin APIs</strong></summary>

- `GET /api/admin/analytics` - System analytics
- `GET /api/admin/company` - Company settings
- `POST /api/admin/company` - Update company settings
- `GET /api/activities` - System activity logs

</details>

---

## 🎯 Usage Scenarios

### 👨‍💼 For Business Owners
1. **🔧 Clone and configure** the repository with your company details
2. **👑 Set up super admin** credentials in environment variables
3. **🎨 Customize branding** through the admin panel
4. **👥 Invite team members** and manage permissions
5. **📊 Monitor usage** through analytics dashboard

### 👨‍💻 For Employees
1. **📝 Register** for an account on the platform
2. **⏳ Wait for admin approval** and activation
3. **🔑 Login** and start uploading files
4. **🗂️ Organize files** in folders and categories
5. **🤝 Share content** with team members

### 👨‍⚖️ For Administrators
1. **✅ Approve/reject** user registrations
2. **👁️ Monitor** system activities and usage
3. **⚙️ Configure** system settings and permissions
4. **📈 Generate reports** and analytics
5. **🛡️ Manage security** and access controls

---

## 🚀 Production Deployment

### 🔨 Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### ☁️ Environment Considerations

- **🔒 Secure your environment variables** in production
- **🗄️ Use managed database** services for scalability
- **📁 Configure persistent storage** for file uploads
- **📧 Set up email services** for notifications
- **🛡️ Enable HTTPS** and security headers

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💻 Make** your changes
4. **✅ Add** tests if applicable
5. **📝 Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **🚀 Push** to the branch (`git push origin feature/amazing-feature`)
7. **📬 Submit** a pull request

### 📋 Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test your changes thoroughly

---

## 📊 Performance & Scalability

<div align="center">
  <table>
    <tr>
      <td align="center">
        <h4>⚡ Performance</h4>
        <ul align="left">
          <li>Server-side rendering with Next.js</li>
          <li>Optimized database queries with Prisma</li>
          <li>Image optimization and lazy loading</li>
          <li>Efficient file upload handling</li>
        </ul>
      </td>
      <td align="center">
        <h4>📈 Scalability</h4>
        <ul align="left">
          <li>Horizontal scaling support</li>
          <li>Database connection pooling</li>
          <li>CDN-ready file storage</li>
          <li>Microservices architecture ready</li>
        </ul>
      </td>
    </tr>
  </table>
</div>

---

## 🛡️ Security Features

- 🔐 **Password Hashing:** bcryptjs with salt rounds
- 🎫 **Session Management:** Secure JWT tokens with NextAuth.js
- 🛡️ **Input Validation:** Server-side validation and sanitization
- 📝 **Activity Logging:** Comprehensive audit trails
- 🌐 **IP Tracking:** Request origin monitoring
- 🔒 **File Security:** MIME type validation and secure storage

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 💬 Support & Community

<div align="center">
  <table>
    <tr>
      <td align="center">
        <a href="https://github.com/ahmedgfathy/pmcloud/issues">
          <img src="https://img.shields.io/badge/🐛_Report_Bug-GitHub_Issues-red?style=for-the-badge" alt="Report Bug">
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/ahmedgfathy/pmcloud/discussions">
          <img src="https://img.shields.io/badge/💬_Discussions-GitHub-blue?style=for-the-badge" alt="Discussions">
        </a>
      </td>
      <td align="center">
        <a href="mailto:admin@pmcloud.com">
          <img src="https://img.shields.io/badge/📧_Contact-Email-green?style=for-the-badge" alt="Email">
        </a>
      </td>
    </tr>
  </table>
</div>

---

<div align="center">
  <h2>🌟 Star this repository if you find it helpful! 🌟</h2>
  
  <p>
    <strong>PM Cloud</strong> - Enterprise-grade file management for the modern workplace
  </p>
  
  <p>
    Made with ❤️ by developers, for developers
  </p>
  
  <img src="https://img.shields.io/github/last-commit/ahmedgfathy/pmcloud?style=for-the-badge" alt="Last Commit">
  <img src="https://img.shields.io/github/commit-activity/m/ahmedgfathy/pmcloud?style=for-the-badge" alt="Commit Activity">
</div>
