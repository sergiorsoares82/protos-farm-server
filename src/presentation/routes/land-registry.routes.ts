import { Router } from 'express';
import { LandRegistryController } from '../controllers/LandRegistryController.js';
import { LandRegistryRepository } from '../../infrastructure/repositories/LandRegistryRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createLandRegistryRoutes(): Router {
  const router = Router();
  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const repo = new LandRegistryRepository();
  const controller = new LandRegistryController(repo);

  router.get('/', canViewEntity(EntityType.LAND_REGISTRY), (req, res) => controller.getAll(req, res));
  router.post('/', canCreateEntity(EntityType.LAND_REGISTRY), (req, res) => controller.create(req, res));
  router.put('/:id/owners', canEditEntity(EntityType.LAND_REGISTRY), (req, res) => controller.upsertOwners(req, res));
  router.put('/:id', canEditEntity(EntityType.LAND_REGISTRY), (req, res) => controller.update(req, res));

  return router;
}
