# Quick Start Guide - Chung Hua Media Management

## 🚀 Get up and running in 5 minutes!

### Prerequisites ✅
- [XAMPP](https://www.apachefriends.org/) installed and running
- [Node.js](https://nodejs.org/) v16+ installed
- Git installed

### 1. Clone & Install 📦
```bash
git clone <repo-url>
cd memories
npm run install-all
```

### 2. Setup Database 🗄️
1. Start XAMPP (Apache + MySQL)
2. Open http://localhost/phpmyadmin
3. Create database: `chung_hua_media`
4. Import schema:
```bash
mysql -u root chung_hua_media < database/schema.sql
```

### 3. Configure Environment 🔧
Create `backend/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=chung_hua_media
PORT=5000
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 4. Create Upload Directory 📁
```bash
mkdir backend/uploads
```

### 5. Start Development Servers 🏃‍♂️
```bash
npm run dev
```

### 6. Access Application 🌐
- **Frontend**: http://localhost:3000
- **API**: http://localhost:5000/api/health

### 7. Login 👤
- **Email**: admin@chunghwa.edu.my
- **Password**: admin123

## 🎉 You're all set!

### Next Steps:
1. Change admin password
2. Create invite codes for users
3. Start uploading media
4. Organize by events

---
**Need help?** Check the full README.md for detailed instructions. 