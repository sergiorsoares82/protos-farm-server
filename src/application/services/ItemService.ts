import type { IItemRepository } from '../../domain/repositories/IItemRepository.js';
import { Item } from '../../domain/entities/Item.js';
import { ItemType } from '../../domain/enums/ItemType.js';
import type { CreateItemDTO, UpdateItemDTO, ItemFiltersDTO } from '../dtos/ItemDTOs.js';

export class ItemService {
    constructor(private readonly itemRepository: IItemRepository) { }

    /**
     * Create a new item
     */
    async createItem(tenantId: string, data: CreateItemDTO): Promise<Item> {
        // Check if name already exists
        const exists = await this.itemRepository.existsByName(data.name, tenantId);
        if (exists) {
            throw new Error('An item with this name already exists');
        }

        let item: Item;

        if (data.type === ItemType.PRODUCT) {
            // Validate stock control requirements
            if (data.isStockControlled) {
                if (!data.initialStockDate) {
                    throw new Error('Initial stock date is required when stock control is enabled');
                }
                if (data.stockQuantity === undefined) {
                    throw new Error('Stock quantity is required when stock control is enabled');
                }
                if (data.price === undefined) {
                    throw new Error('Price is required when stock control is enabled');
                }
            }

            item = Item.createProduct(
                tenantId,
                data.name,
                data.description,
                data.price,
                data.unit,
                {
                    sku: data.sku,
                    isStockControlled: data.isStockControlled,
                    initialStockDate: data.initialStockDate ? new Date(data.initialStockDate) : undefined,
                    stockQuantity: data.stockQuantity,
                    minStockLevel: data.minStockLevel,
                    category: data.category,
                }
            );
        } else if (data.type === ItemType.SERVICE) {
            item = Item.createService(
                tenantId,
                data.name,
                data.description,
                data.price,
                data.unit
            );
        } else {
            // For future types (ASSET, PAYROLL)
            throw new Error(`Item type ${data.type} is not yet supported`);
        }

        return await this.itemRepository.save(item, tenantId);
    }

    /**
     * Get item by ID
     */
    async getItem(tenantId: string, id: string): Promise<Item> {
        const item = await this.itemRepository.findById(id, tenantId);
        if (!item) {
            throw new Error('Item not found');
        }
        return item;
    }

    /**
     * Update item
     */
    async updateItem(tenantId: string, id: string, data: UpdateItemDTO): Promise<Item> {
        const item = await this.itemRepository.findById(id, tenantId);
        if (!item) {
            throw new Error('Item not found');
        }

        // Check if name is being changed and if it already exists
        if (data.name && data.name !== item.getName()) {
            const exists = await this.itemRepository.existsByName(data.name, tenantId, id);
            if (exists) {
                throw new Error('An item with this name already exists');
            }
        }

        // Update basic info
        if (data.name || data.description !== undefined ||
            data.price !== undefined || data.unit !== undefined) {
            item.updateInfo(
                data.name || item.getName(),
                data.description !== undefined ? data.description : item.getDescription(),
                data.price !== undefined ? data.price : item.getPrice(),
                data.unit !== undefined ? data.unit : item.getUnit()
            );
        }

        // Update product details if applicable
        if (item.getType() === ItemType.PRODUCT) {
            const productUpdates: any = {};
            if (data.sku !== undefined) productUpdates.sku = data.sku;
            if (data.isStockControlled !== undefined) productUpdates.isStockControlled = data.isStockControlled;
            if (data.initialStockDate !== undefined) productUpdates.initialStockDate = new Date(data.initialStockDate);
            if (data.stockQuantity !== undefined) productUpdates.stockQuantity = data.stockQuantity;
            if (data.minStockLevel !== undefined) productUpdates.minStockLevel = data.minStockLevel;
            if (data.category !== undefined) productUpdates.category = data.category;

            if (Object.keys(productUpdates).length > 0) {
                item.updateProductDetails(productUpdates);
            }
        }

        // Update active status
        if (data.isActive !== undefined) {
            if (data.isActive) {
                item.activate();
            } else {
                item.deactivate();
            }
        }

        return await this.itemRepository.save(item, tenantId);
    }

    /**
     * Delete item
     */
    async deleteItem(tenantId: string, id: string): Promise<void> {
        // Check if item exists
        const item = await this.itemRepository.findById(id, tenantId);
        if (!item) {
            throw new Error('Item not found');
        }

        await this.itemRepository.delete(id, tenantId);
    }

    /**
     * Get all items with filters
     */
    async getAllItems(tenantId: string, filters?: ItemFiltersDTO): Promise<Item[]> {
        if (filters?.type) {
            return await this.itemRepository.findByType(filters.type, tenantId);
        } else if (filters?.active) {
            return await this.itemRepository.findActive(tenantId);
        } else {
            return await this.itemRepository.findAll(tenantId);
        }
    }
}
