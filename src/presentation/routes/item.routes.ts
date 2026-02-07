import { Router } from 'express';
import { ItemController } from '../controllers/ItemController.js';
import { ItemService } from '../../application/services/ItemService.js';
import { StockMovementTypeService } from '../../application/services/StockMovementTypeService.js';
import { StockMovementService } from '../../application/services/StockMovementService.js';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository.js';
import { StockMovementTypeRepository } from '../../infrastructure/repositories/StockMovementTypeRepository.js';
import { StockMovementRepository } from '../../infrastructure/repositories/StockMovementRepository.js';
import { WorkLocationRepository } from '../../infrastructure/repositories/WorkLocationRepository.js';
import { SeasonRepository } from '../../infrastructure/repositories/SeasonRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { ManagementAccountRepository } from '../../infrastructure/repositories/ManagementAccountRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

/**
 * Create and configure item routes
 */
export function createItemRoutes(): Router {
    const router = Router();

    // Apply authentication and tenant middleware to all item routes
    router.use(authenticate);
    router.use(tenantContextMiddleware);
    router.use(requireTenant);

    const itemRepository = new ItemRepository();
    const stockMovementTypeRepository = new StockMovementTypeRepository();
    const stockMovementTypeService = new StockMovementTypeService(stockMovementTypeRepository);
    const stockMovementRepository = new StockMovementRepository();
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
    const itemService = new ItemService(
        itemRepository,
        stockMovementTypeService,
        stockMovementService,
    );
    const itemController = new ItemController(itemService);

    /**
     * GET /api/items
     * Get all items (supports ?type=PRODUCT&active=true query params)
     */
    router.get(
        '/',
        canViewEntity(EntityType.ITEM),
        (req, res) => itemController.getAllItems(req, res)
    );

    /**
     * POST /api/items
     * Create a new item
     */
    router.post(
        '/',
        canCreateEntity(EntityType.ITEM),
        (req, res) => itemController.createItem(req, res)
    );

    /**
     * GET /api/items/:id
     * Get item by ID
     */
    router.get(
        '/:id',
        canViewEntity(EntityType.ITEM),
        (req, res) => itemController.getItem(req, res)
    );

    /**
     * PUT /api/items/:id
     * Update item
     */
    router.put(
        '/:id',
        canEditEntity(EntityType.ITEM),
        (req, res) => itemController.updateItem(req, res)
    );

    /**
     * DELETE /api/items/:id
     * Delete item
     */
    router.delete(
        '/:id',
        canDeleteEntity(EntityType.ITEM),
        (req, res) => itemController.deleteItem(req, res)
    );

    return router;
}
