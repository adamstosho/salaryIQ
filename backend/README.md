# Performance-Based Salary Generator Backend

A complete Node.js backend for managing performance-based salary calculations with JWT authentication, role-based access control, and comprehensive API endpoints.

## 🚀 Features

- **🔐 Authentication**: JWT-based authentication with role-based access control
- **👥 User Management**: Admin and employee roles with different permissions
- **📊 Performance Tracking**: Record and manage employee performance metrics
- **💰 Salary Calculation**: Automated salary calculation based on performance scores
- **📈 Salary History**: Track and view salary history with detailed breakdowns
- **⚙️ Settings Management**: Global application settings and system statistics
- **🛡️ Security**: Input validation, rate limiting, and security middleware
- **📚 API Documentation**: Complete OpenAPI 3.0 specification

## 🏗️ Architecture

The backend follows the MVC (Model-View-Controller) pattern with a clean folder structure:

```
backend/
├── controllers/     # Business logic and request handlers
├── middleware/      # Authentication, validation, and security middleware
├── models/         # Mongoose schemas and database models
├── routes/         # API route definitions
├── scripts/        # Database seeding and utility scripts
├── server.js       # Main application entry point
├── package.json    # Dependencies and scripts
├── env.example     # Environment variables template
├── swagger.yaml    # OpenAPI 3.0 specification
└── README.md       # This file
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Documentation**: OpenAPI 3.0 (Swagger)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

**For Windows:**
```bash
# Navigate to backend directory
cd backend

# Run the setup script
setup.bat
```

**For macOS/Linux:**
```bash
# Navigate to backend directory
cd backend

# Make the script executable and run it
chmod +x setup.sh
./setup.sh
```

### 2. Manual Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Environment Variables

Update the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/performance-salary
MONGODB_URI_PROD=mongodb+srv://username:password@cluster.mongodb.net/performance-salary

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Default Settings
DEFAULT_SALARY_MULTIPLIER=100
```

### 4. Database Setup

```bash
# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
npm run seed
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

### 3. Access API Documentation

Once the server is running, you can access the interactive API documentation:

- **Swagger UI**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/health

## 📊 Database Seeding

The seed script creates sample data for testing:

```bash
npm run seed
```

**Default Login Credentials:**
- **Admin**: `admin@company.com` / `admin123`
- **Employee**: `john.doe@company.com` / `employee123`

## 🔐 Authentication

### JWT Token

Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles

- **Admin**: Full access to all endpoints and data
- **Employee**: Limited access to own data and performance records

## 📚 API Documentation

### Interactive Documentation

The API documentation is automatically served by the application:

1. **Swagger UI**: http://localhost:5000/api-docs (when server is running)
2. **Postman**: Import the `swagger.yaml` file into Postman
3. **Standalone**: Use the `swagger.yaml` file with any OpenAPI 3.0 compatible tool

### API Endpoints Overview

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

#### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/stats` - User statistics (Admin)

#### Performance
- `GET /api/performance` - Get performance records
- `POST /api/performance` - Create performance record
- `GET /api/performance/:id` - Get performance record
- `PUT /api/performance/:id` - Update performance record
- `DELETE /api/performance/:id` - Delete performance record
- `GET /api/performance/stats` - Performance statistics

#### Salary
- `POST /api/salary/calculate` - Calculate salary (Admin)
- `GET /api/salary/me` - Get user's salary history
- `GET /api/salary/all` - Get all salary history (Admin)
- `GET /api/salary/stats` - Salary statistics (Admin)
- `GET /api/salary/breakdown/:period` - Salary breakdown

#### Settings
- `GET /api/settings` - Get settings (Admin)
- `PUT /api/settings` - Update settings (Admin)
- `POST /api/settings/reset` - Reset settings (Admin)
- `GET /api/settings/stats` - System statistics (Admin)
- `GET /api/settings/health` - System health (Admin)

## 💰 Salary Calculation Logic

The salary calculation follows this formula:

```
Salary = Base Salary + (Total Weighted Score × Multiplier)
```

Where:
- **Base Salary**: Employee's fixed base salary
- **Total Weighted Score**: Sum of all performance scores with difficulty multipliers
- **Multiplier**: Global multiplier set by admin (default: 100)

### Difficulty Multipliers
- **Easy**: 1.0x
- **Medium**: 1.2x
- **Hard**: 1.5x

### Example Calculation
```
Base Salary: $50,000
Performance Records:
- Task 1: Score 85, Difficulty Medium (1.2x) = 102 weighted points
- Task 2: Score 92, Difficulty Hard (1.5x) = 138 weighted points
Total Weighted Score: 240 points
Multiplier: 100

Salary = $50,000 + (240 × 100) = $74,000
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for admin and employee roles
- **Input Validation**: Comprehensive request validation using express-validator
- **Rate Limiting**: Protection against brute force attacks
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection
- **Password Hashing**: Bcrypt password hashing
- **SQL Injection Protection**: Mongoose ODM protection

## 📈 Performance Features

- **Database Indexing**: Optimized queries with proper indexes
- **Pagination**: Efficient data retrieval with pagination
- **Aggregation Pipelines**: Complex statistics using MongoDB aggregation
- **Virtual Fields**: Computed fields for performance metrics
- **Population**: Efficient related data loading

## 🧪 Testing

### Manual Testing

Use the provided seed data and test endpoints:

1. **Login as Admin**:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@company.com","password":"admin123"}'
   ```

2. **Create Performance Record**:
   ```bash
   curl -X POST http://localhost:5000/api/performance \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"taskName":"API Development","score":90,"difficulty":"hard"}'
   ```

3. **Calculate Salary**:
   ```bash
   curl -X POST http://localhost:5000/api/salary/calculate \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json"
   ```

## 🚀 Deployment

### Production Setup

1. **Environment Variables**:
   ```bash
   NODE_ENV=production
   MONGODB_URI_PROD=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build and Start**:
   ```bash
   npm install --production
   npm start
   ```

3. **Process Manager** (Recommended):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "salary-api"
   pm2 startup
   pm2 save
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@company.com

## 🔄 Version History

- **v1.0.0**: Initial release with complete backend functionality
  - JWT authentication
  - User management
  - Performance tracking
  - Salary calculation
  - Settings management
  - OpenAPI documentation 