#!/bin/bash

echo "🚀 Setting up Performance-Based Salary Generator Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your configuration before starting the server"
    echo "   - Set your MongoDB URI"
    echo "   - Set a secure JWT_SECRET"
    echo "   - Configure other settings as needed"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start MongoDB (if running locally)"
echo "3. Run 'npm run seed' to populate the database with sample data"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "🌐 Once started, you can access:"
echo "   - API Documentation: http://localhost:5000/api-docs"
echo "   - Health Check: http://localhost:5000/health"
echo ""
echo "🔑 Default login credentials (after seeding):"
echo "   - Admin: admin@company.com / admin123"
echo "   - Employee: john.doe@company.com / employee123" 