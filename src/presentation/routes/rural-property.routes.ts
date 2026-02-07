import { Router } from 'express';
import { RuralPropertyController } from '../controllers/RuralPropertyController.js';
import { RuralPropertyRepository } from '../../infrastructure/repositories/RuralPropertyRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createRuralPropertyRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new RuralPropertyRepository();
  const controller = new RuralPropertyController(repo);

  router.get('/', canViewEntity(EntityType.RURAL_PROPERTY), (req, res) => controller.getAll(req, res));
  router.post('/', canCreateEntity(EntityType.RURAL_PROPERTY), (req, res) => controller.create(req, res));
  router.put('/:id', canEditEntity(EntityType.RURAL_PROPERTY), (req, res) => controller.update(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.RURAL_PROPERTY), (req, res) => controller.delete(req, res));

  return router;
}
