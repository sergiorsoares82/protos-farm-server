import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import * as SupplierController from '../controllers/SupplierController.js';

export function createSupplierRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  router.get('/', (req, res) => SupplierController.listSuppliers(req, res));
  return router;
}
