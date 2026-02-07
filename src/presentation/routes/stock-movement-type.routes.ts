import { Router } from 'express';
import { StockMovementTypeController } from '../controllers/StockMovementTypeController.js';
import { StockMovementTypeService } from '../../application/services/StockMovementTypeService.js';
import { StockMovementTypeRepository } from '../../infrastructure/repositories/StockMovementTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createStockMovementTypeRoutes(): Router {
  const router = Router();

  const stockMovementTypeRepository = new StockMovementTypeRepository();
  const stockMovementTypeService = new StockMovementTypeService(stockMovementTypeRepository);
  const stockMovementTypeController = new StockMovementTypeController(stockMovementTypeService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.STOCK_MOVEMENT_TYPE), (req, res) => stockMovementTypeController.getAllTypes(req, res));
  router.get('/:id', canViewEntity(EntityType.STOCK_MOVEMENT_TYPE), (req, res) => stockMovementTypeController.getType(req, res));

  router.use(requireOrgAdmin);
  router.post('/', canCreateEntity(EntityType.STOCK_MOVEMENT_TYPE), (req, res) => stockMovementTypeController.createType(req, res));
  router.put('/:id', canEditEntity(EntityType.STOCK_MOVEMENT_TYPE), (req, res) => stockMovementTypeController.updateType(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.STOCK_MOVEMENT_TYPE), (req, res) => stockMovementTypeController.deleteType(req, res));

  return router;
}
