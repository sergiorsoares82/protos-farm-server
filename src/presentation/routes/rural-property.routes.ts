import { Router } from 'express';
import { RuralPropertyController } from '../controllers/RuralPropertyController.js';
import { RuralPropertyRepository } from '../../infrastructure/repositories/RuralPropertyRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createRuralPropertyRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new RuralPropertyRepository();
  const controller = new RuralPropertyController(repo);

  router.get('/', (req, res) => controller.getAll(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));
  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}
