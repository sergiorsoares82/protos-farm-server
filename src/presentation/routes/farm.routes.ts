import { Router } from 'express';
import { FarmController } from '../controllers/FarmController.js';
import { FarmRepository } from '../../infrastructure/repositories/FarmRepository.js';
import { ProductionSiteRepository } from '../../infrastructure/repositories/ProductionSiteRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createFarmRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new FarmRepository();
  const productionSiteRepo = new ProductionSiteRepository();
  const controller = new FarmController(repo, productionSiteRepo);

  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id/production-sites', (req, res) => controller.getProductionSites(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
