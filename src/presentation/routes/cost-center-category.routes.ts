import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { CostCenterCategoryController } from '../controllers/CostCenterCategoryController.js';
import { CostCenterCategoryService } from '../../application/services/CostCenterCategoryService.js';
import { CostCenterCategoryRepository } from '../../infrastructure/repositories/CostCenterCategoryRepository.js';
import { requireOrgAdmin, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createCostCenterCategoryRoutes(): Router {
  const router = Router();

  const repository = new CostCenterCategoryRepository();
  const service = new CostCenterCategoryService(repository);
  const controller = new CostCenterCategoryController(service);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  router.use(requireOrgAdmin);

  router.get('/', canViewEntity(EntityType.COST_CENTER_CATEGORY), (req, res) => controller.getAllCategories(req, res));
  router.post('/', canCreateEntity(EntityType.COST_CENTER_CATEGORY), (req, res) => controller.createCategory(req, res));
  router.put('/:id', canEditEntity(EntityType.COST_CENTER_CATEGORY), (req, res) => controller.updateCategory(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.COST_CENTER_CATEGORY), (req, res) => controller.deleteCategory(req, res));

  return router;
}

