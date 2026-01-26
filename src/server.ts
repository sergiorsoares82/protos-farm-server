// Load environment variables FIRST
import './config/env.js';

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializeDatabase } from './infrastructure/database/typeorm.config.js';
import { createAuthRoutes } from './presentation/routes/auth.routes.js';
import { createPersonRoutes } from './presentation/routes/person.routes.js';

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Middleware
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Protos Farm Server API',
    version: '1.0.0',
  });
});

// Auth routes
app.use('/api/auth', createAuthRoutes());

// Person routes
app.use('/api/persons', createPersonRoutes());

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database connection
    await initializeDatabase();

    // Only start server if not running in serverless environment (Vercel)
    if (process.env.VERCEL !== '1') {
      const PORT = Number(process.env.PORT) || 3000;
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server is running on port ${PORT}`);
        console.log(`📍 API endpoints:`);
        console.log(`   Auth:`);
        console.log(`   - POST http://localhost:${PORT}/api/auth/login`);
        console.log(`   - POST http://localhost:${PORT}/api/auth/refresh`);
        console.log(`   Person:`);
        console.log(`   - POST http://localhost:${PORT}/api/persons`);
        console.log(`   - GET http://localhost:${PORT}/api/persons/:id`);
        console.log(`   - PUT http://localhost:${PORT}/api/persons/:id`);
        console.log(`   - POST http://localhost:${PORT}/api/persons/:id/roles`);
        console.log(`   - DELETE http://localhost:${PORT}/api/persons/:id/roles/:role`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start server for local development
startServer();

// Export for Vercel serverless
export default app;