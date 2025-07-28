@echo off
echo 🚀 Setting up Performance-Based Salary Generator Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully!

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env
    echo ⚠️  Please edit .env file with your configuration before starting the server
    echo    - Set your MongoDB URI
    echo    - Set a secure JWT_SECRET
    echo    - Configure other settings as needed
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your configuration
echo 2. Start MongoDB (if running locally)
echo 3. Run 'npm run seed' to populate the database with sample data
echo 4. Run 'npm run dev' to start the development server
echo.
echo 🌐 Once started, you can access:
echo    - API Documentation: http://localhost:5000/api-docs
echo    - Health Check: http://localhost:5000/health
echo.
echo 🔑 Default login credentials (after seeding):
echo    - Admin: admin@company.com / admin123
echo    - Employee: john.doe@company.com / employee123
pause 