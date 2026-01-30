import { Router } from 'express';
import { StockMovementController } from '../controllers/StockMovementController.js';
import { StockMovementService } from '../../application/services/StockMovementService.js';
import { StockMovementRepository } from '../../infrastructure/repositories/StockMovementRepository.js';
import { StockMovementTypeRepository } from '../../infrastructure/repositories/StockMovementTypeRepository.js';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository.js';
import { WorkLocationRepository } from '../../infrastructure/repositories/WorkLocationRepository.js';
import { SeasonRepository } from '../../infrastructure/repositories/SeasonRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { ManagementAccountRepository } from '../../infrastructure/repositories/ManagementAccountRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createStockMovementRoutes(): Router {
  const router = Router();

  const stockMovementRepository = new StockMovementRepository();
  const stockMovementTypeRepository = new StockMovementTypeRepository();
  const itemRepository = new ItemRepository();
  const workLocationRepository = new WorkLocationRepository();
  const seasonRepository = new SeasonRepository();
  const costCenterRepository = new CostCenterRepository();
  const managementAccountRepository = new ManagementAccountRepository();

  const stockMovementService = new StockMovementService(
    stockMovementRepository,
    stockMovementTypeRepository,
    itemRepository,
    workLocationRepository,
    seasonRepository,
    costCenterRepository,
    managementAccountRepository,
  );
  const stockMovementController = new StockMovementController(stockMovementService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => stockMovementController.getAllMovements(req, res));
  router.post('/', (req, res) => stockMovementController.createMovement(req, res));
  router.get('/:id', (req, res) => stockMovementController.getMovement(req, res));
  router.put('/:id', (req, res) => stockMovementController.updateMovement(req, res));
  router.delete('/:id', (req, res) => stockMovementController.deleteMovement(req, res));

  return router;
}
