import { Router } from 'express';
import { LandRegistryController } from '../controllers/LandRegistryController.js';
import { LandRegistryRepository } from '../../infrastructure/repositories/LandRegistryRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createLandRegistryRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new LandRegistryRepository();
  const controller = new LandRegistryController(repo);

  router.get('/', (req, res) => controller.getAll(req, res));
  router.post('/', (req, res) => controller.create(req, res));

  return router;
}
