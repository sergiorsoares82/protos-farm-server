import { Router } from 'express';
import { StateRegistrationController } from '../controllers/StateRegistrationController.js';
import { StateRegistrationRepository } from '../../infrastructure/repositories/StateRegistrationRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createStateRegistrationRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new StateRegistrationRepository();
  const controller = new StateRegistrationController(repo);

  router.get('/', canViewEntity(EntityType.STATE_REGISTRATION), (req, res) => controller.getAll(req, res));
  router.get('/:id', canViewEntity(EntityType.STATE_REGISTRATION), (req, res) => controller.getById(req, res));
  router.post('/', canCreateEntity(EntityType.STATE_REGISTRATION), (req, res) => controller.create(req, res));
  router.put('/:id', canEditEntity(EntityType.STATE_REGISTRATION), (req, res) => controller.update(req, res));

  return router;
}
