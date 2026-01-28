import type { Request, Response } from 'express';
import { ItemService } from '../../application/services/ItemService.js';
import type { CreateItemDTO, UpdateItemDTO, ItemFiltersDTO } from '../../application/dtos/ItemDTOs.js';
import { ItemType } from '../../domain/enums/ItemType.js';

export class ItemController {
    constructor(private itemService: ItemService) { }

    /**
     * Get all items
     * GET /api/items
     */
    async getAllItems(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.tenant!.tenantId;
            const { type, active } = req.query;

            const filters: ItemFiltersDTO = {
                type: type as ItemType,
                active: active === 'true'
            };

            const items = await this.itemService.getAllItems(tenantId, filters);

            res.status(200).json({
                success: true,
                data: items.map(item => item.toJSON()),
            });
        } catch (error) {
            console.error('Get all items error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to get items';

            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    }

    /**
     * Create a new item
     * POST /api/items
     */
    async createItem(req: Request, res: Response): Promise<void> {
        try {
            const tenantId = req.tenant!.tenantId;
            const requestData: CreateItemDTO = req.body;

            const savedItem = await this.itemService.createItem(tenantId, requestData);

            res.status(201).json({
                success: true,
                data: savedItem.toJSON(),
                message: 'Item created successfully',
            });
        } catch (error) {
            console.error('Create item error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    }

    /**
     * Get item by ID
     * GET /api/items/:id
     */
    async getItem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID parameter',
                });
                return;
            }

            const tenantId = req.tenant!.tenantId;
            const item = await this.itemService.getItem(tenantId, id);

            res.status(200).json({
                success: true,
                data: item.toJSON(),
            });
        } catch (error) {
            console.error('Get item error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to get item';

            if (errorMessage === 'Item not found') {
                res.status(404).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }

            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    }

    /**
     * Update item
     * PUT /api/items/:id
     */
    async updateItem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID parameter',
                });
                return;
            }

            const tenantId = req.tenant!.tenantId;
            const requestData: UpdateItemDTO = req.body;

            const updatedItem = await this.itemService.updateItem(tenantId, id, requestData);

            res.status(200).json({
                success: true,
                data: updatedItem.toJSON(),
                message: 'Item updated successfully',
            });
        } catch (error) {
            console.error('Update item error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update item';

            if (errorMessage === 'Item not found') {
                res.status(404).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }

            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    }

    /**
     * Delete item
     * DELETE /api/items/:id
     */
    async deleteItem(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            if (!id || typeof id !== 'string') {
                res.status(400).json({
                    success: false,
                    error: 'Invalid ID parameter',
                });
                return;
            }

            const tenantId = req.tenant!.tenantId;

            await this.itemService.deleteItem(tenantId, id);

            res.status(200).json({
                success: true,
                message: 'Item deleted successfully',
            });
        } catch (error) {
            console.error('Delete item error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';

            if (errorMessage === 'Item not found') {
                res.status(404).json({
                    success: false,
                    error: errorMessage,
                });
                return;
            }

            res.status(400).json({
                success: false,
                error: errorMessage,
            });
        }
    }
}
