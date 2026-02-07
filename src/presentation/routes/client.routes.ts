import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import * as ClientController from '../controllers/ClientController.js';

export function createClientRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  router.get('/', canViewEntity(EntityType.CLIENT), (req, res) => ClientController.listClients(req, res));
  return router;
}
