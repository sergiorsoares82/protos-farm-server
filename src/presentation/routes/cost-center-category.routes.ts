import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { CostCenterCategoryController } from '../controllers/CostCenterCategoryController.js';
import { CostCenterCategoryService } from '../../application/services/CostCenterCategoryService.js';
import { CostCenterCategoryRepository } from '../../infrastructure/repositories/CostCenterCategoryRepository.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

export function createCostCenterCategoryRoutes(): Router {
  const router = Router();

  const repository = new CostCenterCategoryRepository();
  const service = new CostCenterCategoryService(repository);
  const controller = new CostCenterCategoryController(service);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);
  router.use(requireOrgAdmin);

  router.get('/', (req, res) => controller.getAllCategories(req, res));
  router.post('/', (req, res) => controller.createCategory(req, res));
  router.put('/:id', (req, res) => controller.updateCategory(req, res));
  router.delete('/:id', (req, res) => controller.deleteCategory(req, res));

  return router;
}

