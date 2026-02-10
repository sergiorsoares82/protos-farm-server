import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { CostCenterKindCategoryController } from '../controllers/CostCenterKindCategoryController.js';
import { CostCenterKindCategoryService } from '../../application/services/CostCenterKindCategoryService.js';
import { CostCenterKindCategoryRepository } from '../../infrastructure/repositories/CostCenterKindCategoryRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import {
  requireOrgAdmin,
  canViewEntity,
  canCreateEntity,
  canEditEntity,
  canDeleteEntity,
} from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createCostCenterKindCategoryRoutes(): Router {
  const router = Router();

  const kindCategoryRepository = new CostCenterKindCategoryRepository();
  const costCenterRepository = new CostCenterRepository();
  const service = new CostCenterKindCategoryService(kindCategoryRepository, costCenterRepository);
  const controller = new CostCenterKindCategoryController(service);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  router.use(requireOrgAdmin);

  router.get('/', canViewEntity(EntityType.COST_CENTER_KIND_CATEGORY), (req, res) =>
    controller.getAll(req, res),
  );
  router.get('/:id', canViewEntity(EntityType.COST_CENTER_KIND_CATEGORY), (req, res) =>
    controller.getById(req, res),
  );
  router.post('/', canCreateEntity(EntityType.COST_CENTER_KIND_CATEGORY), (req, res) =>
    controller.create(req, res),
  );
  router.put('/:id', canEditEntity(EntityType.COST_CENTER_KIND_CATEGORY), (req, res) =>
    controller.update(req, res),
  );
  router.delete('/:id', canDeleteEntity(EntityType.COST_CENTER_KIND_CATEGORY), (req, res) =>
    controller.delete(req, res),
  );

  return router;
}
