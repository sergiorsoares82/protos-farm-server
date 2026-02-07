import { Router } from 'express';
import { ActivityTypeController } from '../controllers/ActivityTypeController.js';
import { ActivityTypeService } from '../../application/services/ActivityTypeService.js';
import { ActivityTypeRepository } from '../../infrastructure/repositories/ActivityTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAdmin, canManageActivityType, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

/**
 * Activity types: super-admin can create system types (tenant_id null, available to all orgs).
 * Org-admin can create/edit/delete only their organization's types. Only org-admin and super-admin can manage.
 */
export function createActivityTypeRoutes(): Router {
  const router = Router();

  const repository = new ActivityTypeRepository();
  const service = new ActivityTypeService(repository);
  const controller = new ActivityTypeController(service);

  router.use(authenticate);
  router.use(requireOrgAdmin);

  router.get('/', canViewEntity(EntityType.ACTIVITY_TYPE), (req, res) => controller.getAll(req, res));
  router.get('/:id', canViewEntity(EntityType.ACTIVITY_TYPE), (req, res) => controller.getById(req, res));
  router.post('/', canCreateEntity(EntityType.ACTIVITY_TYPE), (req, res) => controller.create(req, res));
  router.put('/:id', canManageActivityType, canEditEntity(EntityType.ACTIVITY_TYPE), (req, res) => controller.update(req, res));
  router.delete('/:id', canManageActivityType, canDeleteEntity(EntityType.ACTIVITY_TYPE), (req, res) => controller.delete(req, res));

  return router;
}
