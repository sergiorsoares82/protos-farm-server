import { Router } from 'express';
import { ItemController } from '../controllers/ItemController.js';
import { ItemService } from '../../application/services/ItemService.js';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

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
    const itemService = new ItemService(itemRepository);
    const itemController = new ItemController(itemService);

    /**
     * GET /api/items
     * Get all items (supports ?type=PRODUCT&active=true query params)
     */
    router.get(
        '/',
        (req, res) => itemController.getAllItems(req, res)
    );

    /**
     * POST /api/items
     * Create a new item
     */
    router.post(
        '/',
        (req, res) => itemController.createItem(req, res)
    );

    /**
     * GET /api/items/:id
     * Get item by ID
     */
    router.get(
        '/:id',
        (req, res) => itemController.getItem(req, res)
    );

    /**
     * PUT /api/items/:id
     * Update item
     */
    router.put(
        '/:id',
        (req, res) => itemController.updateItem(req, res)
    );

    /**
     * DELETE /api/items/:id
     * Delete item
     */
    router.delete(
        '/:id',
        (req, res) => itemController.deleteItem(req, res)
    );

    return router;
}
