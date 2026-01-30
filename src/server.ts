// Load environment variables FIRST
import './config/env.js';

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializeDatabase } from './infrastructure/database/typeorm.config.js';
import { createAuthRoutes } from './presentation/routes/auth.routes.js';
import { createPersonRoutes } from './presentation/routes/person.routes.js';
import { createOrganizationRoutes } from './presentation/routes/organization.routes.js';
import { createUserRoutes } from './presentation/routes/user.routes.js';
import { createDocumentTypeRoutes } from './presentation/routes/documentType.routes.js';
import { createItemRoutes } from './presentation/routes/item.routes.js';
import { createCostCenterCategoryRoutes } from './presentation/routes/cost-center-category.routes.js';
import { createCostCenterRoutes } from './presentation/routes/cost-center.routes.js';
import { createManagementAccountRoutes } from './presentation/routes/management-account.routes.js';
import { createWorkLocationRoutes } from './presentation/routes/work-location.routes.js';
import { createWorkLocationTypeRoutes } from './presentation/routes/work-location-type.routes.js';
import { createSeasonRoutes } from './presentation/routes/season.routes.js';
import { createMachineTypeRoutes } from './presentation/routes/machine-type.routes.js';
import { createMachineRoutes } from './presentation/routes/machine.routes.js';
import { createAssetRoutes } from './presentation/routes/asset.routes.js';

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

// When running behind a proxy/load balancer (e.g. Vercel, Nginx),
// trust the X-Forwarded-* headers so express-rate-limit can identify clients correctly.
// This is safe locally as well.
app.set('trust proxy', 1);

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

// Organization routes
app.use('/api/organizations', createOrganizationRoutes());

// User management routes
app.use('/api/users', createUserRoutes());

// Document types (super admin only)
app.use('/api/document-types', createDocumentTypeRoutes());

// Item routes
app.use('/api/items', createItemRoutes());

// Cost center categories
app.use('/api/cost-center-categories', createCostCenterCategoryRoutes());

// Cost Center routes
app.use('/api/cost-centers', createCostCenterRoutes());

// Management Account routes
app.use('/api/management-accounts', createManagementAccountRoutes());

// Work locations (Locais de Trabalho: talhões, galpões, ordenha, fábrica de ração, etc.)
app.use('/api/work-locations', createWorkLocationRoutes());

// Work location types (managed by SuperAdmin and OrgAdmin only)
app.use('/api/work-location-types', createWorkLocationTypeRoutes());

// Season (Safra) routes
app.use('/api/seasons', createSeasonRoutes());

// Machine types (tratores, colheitadeiras, semeadoras...)
app.use('/api/machine-types', createMachineTypeRoutes());

// Machines (cadastro de máquinas)
app.use('/api/machines', createMachineRoutes());

// Assets (patrimônio: máquinas, implementos, equipamentos, benfeitorias)
app.use('/api/assets', createAssetRoutes());

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
        console.log(`   - POST http://localhost:${PORT}/api/auth/logout`);
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