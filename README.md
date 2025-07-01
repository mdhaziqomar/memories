# Chung Hua Middle School BSB - Media Management System

A modern, responsive web application for managing and sharing school media (photos and videos) with features like event categorization, people tagging, and admin-controlled user management.

**Developed by:** Haziq Omar - IT Department  
**License:** Proprietary - Chung Hua Middle School BSB

## 🚀 Features

- **📸 Media Upload**: Drag-and-drop photo and video uploads with automatic thumbnail generation
- **📅 Event Organization**: Categorize media by events, dates, years, and months
- **👥 People Tagging**: Tag people in photos with visual positioning
- **🔐 Secure Access**: Admin-controlled invite system for user registration
- **🎨 Modern UI**: Beautiful Catppuccin Mocha theme with responsive design
- **📱 Mobile Friendly**: Optimized for both desktop and mobile devices
- **⚡ Fast Performance**: Optimized for quick loading and smooth experience

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database (XAMPP for local development)
- **JWT** authentication
- **Multer** for file uploads
- **Sharp** for image processing
- **bcryptjs** for password hashing

### Frontend
- **React 18** with functional components and hooks
- **React Router DOM** for navigation
- **React Query** for data fetching
- **Axios** for HTTP requests
- **React Hook Form** for form handling
- **React Toastify** for notifications
- **Lucide React** for icons
- **Custom Catppuccin Mocha** CSS theme

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **XAMPP** (for MySQL database)
- **Git**

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd memories
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Database Setup

#### Start XAMPP
1. Open XAMPP Control Panel
2. Start Apache and MySQL services

#### Create Database
1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Create a new database named `chung_hua_media`
3. Import the database schema:
   ```bash
   # From the project root directory
   mysql -u root -p chung_hua_media < database/schema.sql
   ```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:
```env
# Database Configuration (XAMPP MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chung_hua_media

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# JWT Secret (Change this in production!)
JWT_SECRET=your_super_secret_jwt_key_here

# File Upload Configuration
MAX_FILE_SIZE=50MB
UPLOAD_PATH=./uploads

# Admin Configuration
ADMIN_EMAIL=admin@chunghwa.edu.my
ADMIN_PASSWORD=admin123
```

### 5. Create Upload Directory
```bash
mkdir backend/uploads
```

### 6. Run the Application

#### Development Mode (Both servers simultaneously)
```bash
# From the root directory
npm run dev
```

#### Or run servers separately

**Backend Server:**
```bash
cd backend
npm run dev
```

**Frontend Server:**
```bash
cd frontend
npm start
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 👤 Default Admin Account

After setting up the database, you can log in with the default admin account:

- **Email**: admin@chunghwa.edu.my
- **Password**: admin123

**⚠️ Important**: Change the default admin password after first login!

## 📂 Project Structure

```
memories/
├── backend/                    # Express.js API server
│   ├── config/                # Database configuration
│   ├── middleware/            # Authentication middleware
│   ├── routes/               # API routes
│   ├── uploads/             # File upload directory
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/                 # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/       # Page components
│   │   ├── services/   # API services
│   │   ├── App.js     # Main app component
│   │   ├── App.css   # Catppuccin Mocha theme
│   │   └── index.js # Entry point
│   └── package.json
├── database/             # Database schema
├── package.json         # Root package.json
└── README.md           # This file
```

## 🎨 Theming

This application uses a custom **Catppuccin Mocha** color scheme that provides:
- Dark theme optimized for reduced eye strain
- Consistent color palette across all components
- Smooth transitions and animations
- Mobile-responsive design
- Accessibility-friendly contrast ratios

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Admin-controlled user registration via invite codes
- File type validation for uploads
- Request rate limiting
- CORS protection
- SQL injection prevention with parameterized queries

## 📱 Mobile Responsiveness

The application is fully responsive and optimized for:
- Desktop computers (1200px+)
- Tablets (768px - 1199px)
- Mobile phones (< 768px)

## 🚀 Deployment

### Production Environment Variables

For production deployment, update the `.env` file with:
```env
NODE_ENV=production
JWT_SECRET=your_production_jwt_secret_here
DB_PASSWORD=your_production_database_password
FRONTEND_URL=https://your-domain.com
```

### Build for Production

```bash
# Build frontend
cd frontend
npm run build

# The build files will be in frontend/build/
```

## 🤝 Contributing

This project is proprietary to Chung Hua Middle School BSB. For any modifications or contributions, please contact the IT Department.

## 📞 Support

For technical support or questions:
- **Developer**: Haziq Omar
- **Department**: IT Department
- **Institution**: Chung Hua Middle School BSB

## 📄 License

This project is proprietary software owned by Chung Hua Middle School BSB. Unauthorized copying, modification, or distribution is prohibited.

---

**© 2025 Chung Hua Middle School BSB - Developed with ❤️ by Haziq Omar** 