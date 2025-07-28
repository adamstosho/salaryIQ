# Quick Installation Guide

## 🚀 One-Click Setup

### Windows Users
```bash
cd backend
setup.bat
```

### macOS/Linux Users
```bash
cd backend
chmod +x setup.sh
./setup.sh
```

## 📋 Manual Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp env.example .env
   # Edit .env with your settings
   ```

3. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

4. **Seed Database**
   ```bash
   npm run seed
   ```

5. **Start Server**
   ```bash
   npm run dev
   ```

## 🌐 Access Points

- **API Documentation**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health
- **API Base URL**: http://localhost:5000/api

## 🔑 Default Credentials

After seeding the database:
- **Admin**: `admin@company.com` / `admin123`
- **Employee**: `john.doe@company.com` / `employee123`

## 📝 Environment Variables

Edit `.env` file with your configuration:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/performance-salary

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000

# Settings
DEFAULT_SALARY_MULTIPLIER=100
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env file
   PORT=5001
   ```

2. **MongoDB connection failed**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify network connectivity

3. **Dependencies installation failed**
   ```bash
   # Clear npm cache
   npm cache clean --force
   # Reinstall
   npm install
   ```

4. **Permission denied (Linux/macOS)**
   ```bash
   chmod +x setup.sh
   ```

### Getting Help

- Check the main README.md for detailed documentation
- Review the API documentation at http://localhost:5000/api-docs
- Check server logs for error messages 