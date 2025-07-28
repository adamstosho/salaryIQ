const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const performanceRoutes = require('./routes/performance');
const salaryRoutes = require('./routes/salary');
const settingsRoutes = require('./routes/settings');
const salaryScheduler = require('./utils/scheduler');

const app = express();

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const swaggerOptions = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Performance-Based Salary Generator API',
      version: '1.0.0',
      description: 'A comprehensive REST API for managing performance-based salary calculations.',
      contact: {
        name: 'API Support',
        email: 'support@company.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://api.company.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token for authentication'
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] 
};

const swaggerFilePath = path.join(__dirname, 'swagger.yaml');
let swaggerSpec;

try {
  const swaggerYaml = fs.readFileSync(swaggerFilePath, 'utf8');
  const yaml = require('js-yaml');
  swaggerSpec = yaml.load(swaggerYaml);
} catch (error) {
  console.warn('Could not load swagger.yaml, using JSDoc comments instead');
  swaggerSpec = swaggerJsdoc(swaggerOptions);
}

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Performance Salary API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true
  }
}));

app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Performance Salary Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Performance Salary Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/settings', settingsRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: Object.values(err.errors).map(e => e.message) 
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate field value' });
  }
  
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal Server Error' 
  });
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.NODE_ENV === 'production' 
        ? process.env.MONGODB_URI_PROD 
        : process.env.MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  salaryScheduler.start();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`Health Check: http://localhost:${PORT}/health`);
    console.log('Salary scheduler started');
  });
};

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  salaryScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  salaryScheduler.stop();
  process.exit(0);
});

startServer();

module.exports = app; 