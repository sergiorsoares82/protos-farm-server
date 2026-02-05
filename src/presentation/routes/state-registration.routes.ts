import { Router } from 'express';
import { StateRegistrationController } from '../controllers/StateRegistrationController.js';
import { StateRegistrationRepository } from '../../infrastructure/repositories/StateRegistrationRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createStateRegistrationRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new StateRegistrationRepository();
  const controller = new StateRegistrationController(repo);

  router.get('/', (req, res) => controller.getAll(req, res));
  router.get('/:id', (req, res) => controller.getById(req, res));
  router.post('/', (req, res) => controller.create(req, res));
  router.put('/:id', (req, res) => controller.update(req, res));

  return router;
}
