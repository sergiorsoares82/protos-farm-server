import { Router } from 'express';
import { FarmController } from '../controllers/FarmController.js';
import { FarmRepository } from '../../infrastructure/repositories/FarmRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createFarmRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new FarmRepository();
  const controller = new FarmController(repo);

  router.get('/', canViewEntity(EntityType.FARM), (req, res) => controller.getAll(req, res));
  router.get('/:id', canViewEntity(EntityType.FARM), (req, res) => controller.getById(req, res));
  router.post('/', canCreateEntity(EntityType.FARM), (req, res) => controller.create(req, res));
  router.put('/:id', canEditEntity(EntityType.FARM), (req, res) => controller.update(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.FARM), (req, res) => controller.delete(req, res));

  return router;
}
