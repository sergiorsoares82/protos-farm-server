// Load environment variables FIRST
import './config/env.js';

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initializeDatabase } from './infrastructure/database/typeorm.config.js';
import { createAuthRoutes } from './presentation/routes/auth.routes.js';
import { createPersonRoutes } from './presentation/routes/person.routes.js';
import { createFarmRoutes } from './presentation/routes/farm.routes.js';
import { createOrganizationRoutes } from './presentation/routes/organization.routes.js';
import { createUserRoutes } from './presentation/routes/user.routes.js';
import { createDocumentTypeRoutes } from './presentation/routes/documentType.routes.js';
import { createItemRoutes } from './presentation/routes/item.routes.js';
import { createCostCenterCategoryRoutes } from './presentation/routes/cost-center-category.routes.js';
import { createCostCenterKindCategoryRoutes } from './presentation/routes/cost-center-kind-category.routes.js';
import { createCostCenterRoutes } from './presentation/routes/cost-center.routes.js';
import { createManagementAccountRoutes } from './presentation/routes/management-account.routes.js';
import { createWorkLocationRoutes } from './presentation/routes/work-location.routes.js';
import { createWorkLocationTypeRoutes } from './presentation/routes/work-location-type.routes.js';
import { createUnitOfMeasureRoutes } from './presentation/routes/unit-of-measure.routes.js';
import { createUnitOfMeasureConversionRoutes } from './presentation/routes/unit-of-measure-conversion.routes.js';
import { createSeasonRoutes } from './presentation/routes/season.routes.js';
import { createMachineTypeRoutes } from './presentation/routes/machine-type.routes.js';
import { createMachineRoutes } from './presentation/routes/machine.routes.js';
import { createAssetRoutes } from './presentation/routes/asset.routes.js';
import { createStockMovementTypeRoutes } from './presentation/routes/stock-movement-type.routes.js';
import { createStockMovementRoutes } from './presentation/routes/stock-movement.routes.js';
import { createInvoiceRoutes } from './presentation/routes/invoice.routes.js';
import { createInvoiceFinancialsTypeRoutes } from './presentation/routes/invoice-financials-type.routes.js';
import { createSupplierRoutes } from './presentation/routes/supplier.routes.js';
import { createClientRoutes } from './presentation/routes/client.routes.js';
import { createBankAccountRoutes } from './presentation/routes/bank-account.routes.js';
import { createRuralPropertyRoutes } from './presentation/routes/rural-property.routes.js';
import { createLandRegistryRoutes } from './presentation/routes/land-registry.routes.js';
import { createStateRegistrationRoutes } from './presentation/routes/state-registration.routes.js';
import { createActivityTypeRoutes } from './presentation/routes/activity-type.routes.js';
import { createOperationRoutes } from './presentation/routes/operation.routes.js';
import { createOperationRecordRoutes } from './presentation/routes/operationRecord.routes.js';
import { createPermissionRoutes } from './presentation/routes/permission.routes.js';
import { createRoleRoutes } from './presentation/routes/role.routes.js';

const app = express();

// Start DB initialization immediately so it's ready before first request (avoids race on Vercel cold start)
const dbReady = initializeDatabase();

// Wait for DB to be ready before handling any request (fixes "first request fails" on serverless)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error('Database not ready:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Database is initializing. Please retry.',
      statusCode: 503,
    });
  }
});

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

// Farm routes (fazendas; N:N with proprietários)
app.use('/api/farms', createFarmRoutes());

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

// Cost center kind categories (Máquinas, Benfeitorias, Gerais, etc.)
app.use('/api/cost-center-kind-categories', createCostCenterKindCategoryRoutes());

// Cost Center routes
app.use('/api/cost-centers', createCostCenterRoutes());

// Management Account routes
app.use('/api/management-accounts', createManagementAccountRoutes());

// Work locations (Locais de Trabalho: talhões, galpões, ordenha, fábrica de ração, etc.)
app.use('/api/work-locations', createWorkLocationRoutes());

// Work location types (managed by SuperAdmin and OrgAdmin only)
app.use('/api/work-location-types', createWorkLocationTypeRoutes());

// Activity types (Tipo de Atividade: name + is_active)
app.use('/api/activity-types', createActivityTypeRoutes());

// Operations (Operações: code + hierarchy + activity types)
app.use('/api/operations', createOperationRoutes());

// Operation Records (Apontamentos de Operações)
app.use('/api/operation-records', createOperationRecordRoutes());

// Units of measure (unidade de medida: system + per-org; SuperAdmin/OrgAdmin)
app.use('/api/unit-of-measures', createUnitOfMeasureRoutes());

// Unit of measure conversions (ex.: 1 T = 1000 KG)
app.use('/api/unit-of-measure-conversions', createUnitOfMeasureConversionRoutes());

// Season (Safra) routes
app.use('/api/seasons', createSeasonRoutes());

// Machine types (tratores, colheitadeiras, semeadoras...)
app.use('/api/machine-types', createMachineTypeRoutes());

// Machines (cadastro de máquinas)
app.use('/api/machines', createMachineRoutes());

// Assets (patrimônio: máquinas, implementos, equipamentos, benfeitorias)
app.use('/api/assets', createAssetRoutes());

// Stock movement types (tipos de movimento de estoque: entrada inicial, compra, venda, consumo, ajustes)
app.use('/api/stock-movement-types', createStockMovementTypeRoutes());

// Stock movements (movimentos de estoque)
app.use('/api/stock-movements', createStockMovementRoutes());

// Invoices (notas fiscais)
app.use('/api/invoices', createInvoiceRoutes());

// Invoice financial (payment) types – Super admin can edit system types; Org admin can view and create org types
app.use('/api/invoice-financials-types', createInvoiceFinancialsTypeRoutes());

// Suppliers (for invoice form dropdown)
app.use('/api/suppliers', createSupplierRoutes());

// Clients (for invoice recipient dropdown in RECEITA)
app.use('/api/clients', createClientRoutes());

// Bank accounts (contas bancárias)
app.use('/api/bank-accounts', createBankAccountRoutes());

// Rural properties (imóveis rurais INCRA/CNIR)
app.use('/api/rural-properties', createRuralPropertyRoutes());

// Land registries (matrículas de cartório)
app.use('/api/land-registries', createLandRegistryRoutes());

// State registrations (inscrições estaduais – produtor rural/empresa)
app.use('/api/state-registrations', createStateRegistrationRoutes());

// Permission management (RBAC)
app.use('/api/permissions', createPermissionRoutes());

// Role management
app.use('/api/roles', createRoleRoutes());

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    statusCode: 404,
  });
});

// Global error handler (receives errors from async route handlers via .catch(next))
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const message =
    process.env.NODE_ENV !== 'production' && err?.message
      ? err.message
      : 'An unexpected error occurred';
  res.status(500).json({
    error: 'Internal Server Error',
    message,
    statusCode: 500,
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await dbReady;

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