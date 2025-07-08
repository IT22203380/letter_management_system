require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { systemLogger } = require('./utils/logger');
const sequelize = require('./config/database');

// Import routes
const userRoutes = require('./routes/user.routes');
const letterRoutes = require('./routes/letterRoutes');
const faxRoutes = require('./routes/faxRoutes');
const emailRoutes = require('./routes/emailRoutes');
const normalPostRoutes = require('./routes/normalPost');
const registeredPostRoutes = require('./routes/registeredPostRoutes');

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',  // Temporarily allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range', 'Set-Cookie'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use((req, res, next) => {
  systemLogger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes without /api prefix
app.use('/users', userRoutes);
app.use('/letters', letterRoutes);
app.use('/faxes', faxRoutes);
app.use('/emails', emailRoutes);
app.use('/normal-posts', normalPostRoutes);
app.use('/registered-posts', registeredPostRoutes);
app.use('/letter-stats', letterRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  systemLogger.error(`Error: ${err.message}`, { 
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      status: false,
      message: 'File too large. Maximum size is 10MB per file.'
    });
  }
  
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      status: false,
      message: 'Too many files. Maximum 10 files allowed.'
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      status: false,
      message: 'Unexpected file field.'
    });
  }
  
  res.status(500).json({
    status: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  systemLogger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    status: false, 
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Database sync and server start
const PORT = process.env.PORT || 3000;

// Graceful shutdown
process.on('SIGTERM', () => {
  systemLogger.info('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  systemLogger.info('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

sequelize.sync({ alter: true })
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      systemLogger.info(`Server running on port ${PORT}`);
      systemLogger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      systemLogger.info(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      systemLogger.info(`Upload directory: ${path.join(__dirname, 'uploads')}`);
      
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Database connected & synced');
    });
  })
  .catch(err => {
    systemLogger.error('Unable to connect to the database:', err);
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;