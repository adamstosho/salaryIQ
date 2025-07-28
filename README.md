# SalaryIQ - Smart Performance-Based Salary Management System

## 📋 Table of Contents
- [Introduction](#introduction)
- [Problem Statement](#problem-statement)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage Guide](#usage-guide)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

##  Introduction

SalaryIQ is a modern, intelligent salary management system designed for Nigerian businesses. It automates salary calculations based on employee performance metrics, providing a fair and transparent compensation system. The platform helps organizations track employee performance, calculate performance-based bonuses, and manage salary distributions efficiently.

##  Problem Statement

Traditional salary management systems often lack:
- **Performance-based compensation**: Most systems don't link salary to actual performance metrics
- **Transparency**: Employees can't see how their performance affects their earnings
- **Automation**: Manual salary calculations are time-consuming and error-prone
- **Fairness**: Subjective salary decisions without clear metrics
- **Localization**: Systems not adapted for Nigerian business needs and currency

SalaryIQ solves these problems by providing a data-driven, automated, and transparent salary management solution.

##  Features

###  **Admin Features**
- **User Management**: Create, edit, and manage employee accounts
- **Performance Tracking**: Monitor and approve employee performance records
- **Salary Calculation**: Automated salary computation based on performance
- **System Settings**: Configure salary multipliers and automation settings
- **Analytics Dashboard**: Comprehensive system statistics and insights
- **Bulk Operations**: Approve multiple performance records at once

###  **Employee Features**
- **Performance Recording**: Add and track your task performance
- **Salary History**: View your salary breakdown and history
- **Performance Analytics**: See your performance trends and scores
- **Profile Management**: Update personal information and view employment details

###  **Salary Management**
- **Performance-Based Calculation**: Salaries calculated using weighted performance scores
- **Difficulty Multipliers**: Different task difficulties affect bonus calculations
- **Real-time Updates**: Instant salary calculations when performance is approved
- **Nigerian Naira Support**: Full localization with ₦ currency formatting
- **Salary Breakdown**: Detailed breakdown of base salary and performance bonuses

###  **Analytics & Reporting**
- **Dashboard Analytics**: Real-time system performance metrics
- **Employee Statistics**: Individual and team performance insights
- **Salary Reports**: Comprehensive salary distribution analysis
- **Performance Trends**: Historical performance tracking

## Technology Stack

### Frontend
- **React.js** - Modern UI framework
- **Next.js 14** - Full-stack React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Date-fns** - Date manipulation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

##  Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn package manager

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Configure your environment variables in .env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Configure your environment variables
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Start the development server
npm run dev
```

##  Usage Guide

###  Login Credentials

**Admin Access:**
- Email: `admin@company.com`
- Password: `admin123`

###  **Admin Dashboard**

#### 1. **User Management**
- Navigate to **Users** in the sidebar
- **Add New User**: Click "Add User" button to create employee accounts
- **Edit User**: Click the edit icon to modify user details
- **View Users**: See all employees with their roles and departments

#### 2. **Performance Management**
- Go to **Performance** section
- **View Records**: See all performance submissions
- **Approve Records**: Select records and click "Approve for Salary"
- **Add Records**: Create performance records for employees
- **Filter by Period**: Use date filters to view specific time periods

#### 3. **Salary Calculation**
- Navigate to **Salary** section
- **Calculate Salaries**: Click "Calculate Salary" for the current period
- **View History**: See all calculated salaries
- **Update Status**: Change salary status (pending → approved → paid)
- **View Breakdown**: Click on any salary to see detailed calculation

#### 4. **System Settings**
- Go to **Settings** section
- **Salary Multiplier**: Adjust the global performance bonus multiplier
- **Automation**: Enable/disable automatic salary calculations
- **System Health**: Monitor database and system status

###  **Employee Dashboard**

#### 1. **Performance Tracking**
- Navigate to **Performance** section
- **Add Performance**: Click "Add Performance Record"
- Fill in:
  - Task name
  - Performance score (0-100)
  - Task difficulty (Easy/Medium/Hard)
  - Date completed
  - Notes (optional)
- **View History**: See all your performance records

#### 2. **Salary Information**
- Go to **Salary** section
- **View History**: See your salary history and breakdowns
- **Current Salary**: View your latest calculated salary
- **Performance Impact**: See how your performance affects your salary

#### 3. **Profile Management**
- Navigate to **Profile** section
- **View Details**: See your employment information
- **Edit Profile**: Update your personal details (if allowed)

###  **How Salary Calculation Works**

1. **Performance Recording**: Employees submit performance records for completed tasks
2. **Difficulty Weighting**: Each task has a difficulty multiplier:
   - Easy: 1.0x
   - Medium: 1.5x
   - Hard: 2.0x
3. **Weighted Score**: Performance score × difficulty multiplier
4. **Total Score**: Sum of all weighted scores for the period
5. **Bonus Calculation**: Total score × global multiplier
6. **Final Salary**: Base salary + performance bonus

**Example:**
- Base Salary: ₦100,000
- Performance Records: 3 tasks (85%, 90%, 75%)
- Difficulties: Easy, Medium, Hard
- Weighted Scores: 85, 135, 150
- Total Score: 370
- Global Multiplier: 100
- Performance Bonus: ₦37,000
- **Final Salary: ₦137,000**

## 🔌 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Performance Management
- `GET /api/performance` - Get performance records
- `POST /api/performance` - Create performance record
- `PUT /api/performance/:id` - Update performance record
- `PUT /api/performance/:id/approve` - Approve performance record

### Salary Management
- `POST /api/salary/calculate` - Calculate salaries
- `GET /api/salary/me` - Get user's salary history
- `GET /api/salary/all` - Get all salary records (admin)
- `PUT /api/salary/:id/status` - Update salary status

### System Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update system settings
- `GET /api/settings/stats` - Get system statistics

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

---

**Built with ❤️ by ART_Redox for Nigerian businesses** 