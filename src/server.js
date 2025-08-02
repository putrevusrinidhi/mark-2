// Portfolio Management API Server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectToDatabase, closeConnection } = require('./database/connection');

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Portfolio Management API'
  });
});

// API routes
const apiBasePath = process.env.API_BASE_PATH || '/api/v1';

// Portfolio routes (to be implemented)
app.use(`${apiBasePath}/portfolio`, require('./routes/portfolio'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Portfolio Management API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      portfolio: `${apiBasePath}/portfolio`
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    requestedUrl: req.url
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await closeConnection();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await closeConnection();
  process.exit(0);
});

// Start server
async function startServer() {
  try {
    // Skip MongoDB connection for demo purposes
    console.log('⚠️ Skipping MongoDB connection for demo - using in-memory data');
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Portfolio Management API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`API base path: ${apiBasePath}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
