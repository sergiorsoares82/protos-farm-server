import { Item } from '../entities/Item.js';
import { ItemType } from '../enums/ItemType.js';

/**
 * Repository interface for Item aggregate
 * Manages persistence of Item entities
 */
export interface IItemRepository {
    /**
     * Find all items for a tenant
     */
    findAll(tenantId: string): Promise<Item[]>;

    /**
     * Find items by type for a tenant
     */
    findByType(type: ItemType, tenantId: string): Promise<Item[]>;

    /**
     * Find an item by ID within a tenant
     */
    findById(id: string, tenantId: string): Promise<Item | null>;

    /**
     * Find active items for a tenant
     */
    findActive(tenantId: string): Promise<Item[]>;

    /**
     * Save an item (create or update) within a tenant
     */
    save(item: Item, tenantId: string): Promise<Item>;

    /**
     * Delete an item within a tenant
     */
    delete(id: string, tenantId: string): Promise<void>;

    /**
     * Check if item name exists within a tenant
     */
    existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean>;
}
