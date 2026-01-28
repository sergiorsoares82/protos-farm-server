import { Repository } from 'typeorm';
import type { IItemRepository } from '../../domain/repositories/IItemRepository.js';
import { Item, type ProductDetails } from '../../domain/entities/Item.js';
import { ItemType } from '../../domain/enums/ItemType.js';
import { ItemEntity } from '../database/entities/ItemEntity.js';
import { ProductEntity } from '../database/entities/ProductEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class ItemRepository implements IItemRepository {
    private itemRepo: Repository<ItemEntity>;
    private productRepo: Repository<ProductEntity>;

    constructor() {
        // Use entity classes directly; this matches metadata registered in AppDataSource.entities
        this.itemRepo = AppDataSource.getRepository(ItemEntity);
        this.productRepo = AppDataSource.getRepository(ProductEntity);
    }

    async findAll(tenantId: string): Promise<Item[]> {
        const itemEntities = await this.itemRepo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });

        return itemEntities.map((entity) => this.toDomain(entity));
    }

    async findByType(type: ItemType, tenantId: string): Promise<Item[]> {
        const itemEntities = await this.itemRepo.find({
            where: { type, tenantId },
            order: { createdAt: 'DESC' },
        });

        return itemEntities.map((entity) => this.toDomain(entity));
    }

    async findById(id: string, tenantId: string): Promise<Item | null> {
        const itemEntity = await this.itemRepo.findOne({
            where: { id, tenantId },
        });

        if (!itemEntity) {
            return null;
        }

        return this.toDomain(itemEntity);
    }

    async findActive(tenantId: string): Promise<Item[]> {
        const itemEntities = await this.itemRepo.find({
            where: { tenantId, isActive: true },
            order: { createdAt: 'DESC' },
        });

        return itemEntities.map((entity) => this.toDomain(entity));
    }

    async save(item: Item, tenantId: string): Promise<Item> {
        const itemType = item.getType();

        if (itemType === ItemType.PRODUCT) {
            // Save as ProductEntity
            const productEntity = new ProductEntity();
            productEntity.id = item.getId();
            productEntity.tenantId = tenantId;
            productEntity.name = item.getName();
            productEntity.description = item.getDescription() || null;
            productEntity.type = itemType;
            productEntity.price = item.getPrice() || null;
            productEntity.unit = item.getUnit() || null;
            productEntity.isActive = item.getIsActive();

            const productDetails = item.getProductDetails();
            if (productDetails) {
                productEntity.sku = productDetails.sku || null;
                productEntity.isStockControlled = productDetails.isStockControlled || false;
                productEntity.initialStockDate = productDetails.initialStockDate || null;
                productEntity.stockQuantity = productDetails.stockQuantity || null;
                productEntity.minStockLevel = productDetails.minStockLevel || null;
                productEntity.category = productDetails.category || null;
            }

            const saved = await this.productRepo.save(productEntity);
            return this.toDomain(saved);
        }

        // For other types (SERVICE, ASSET, PAYROLL) - save as base ItemEntity
        const itemEntity = new ItemEntity();
        itemEntity.id = item.getId();
        itemEntity.tenantId = tenantId;
        itemEntity.name = item.getName();
        itemEntity.description = item.getDescription() || null;
        itemEntity.type = itemType;
        itemEntity.price = item.getPrice() || null;
        itemEntity.unit = item.getUnit() || null;
        itemEntity.isActive = item.getIsActive();

        const saved = await this.itemRepo.save(itemEntity);
        return this.toDomain(saved);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        await this.itemRepo.delete({ id, tenantId });
    }

    async existsByName(name: string, tenantId: string, excludeId?: string): Promise<boolean> {
        const query = this.itemRepo.createQueryBuilder('item')
            .where('item.tenantId = :tenantId', { tenantId })
            .andWhere('LOWER(item.name) = LOWER(:name)', { name });

        if (excludeId) {
            query.andWhere('item.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    private toDomain(entity: ItemEntity): Item {
        let productDetails: ProductDetails | undefined;

        if (entity.type === ItemType.PRODUCT && entity instanceof ProductEntity) {
            productDetails = {
                ...(entity.sku && { sku: entity.sku }),
                isStockControlled: entity.isStockControlled,
                ...(entity.initialStockDate && { initialStockDate: entity.initialStockDate }),
                ...(entity.stockQuantity !== null && { stockQuantity: Number(entity.stockQuantity) }),
                ...(entity.minStockLevel !== null && { minStockLevel: Number(entity.minStockLevel) }),
                ...(entity.category && { category: entity.category }),
            };
        }

        return new Item({
            id: entity.id,
            tenantId: entity.tenantId,
            name: entity.name,
            ...(entity.description && { description: entity.description }),
            type: entity.type as ItemType,
            ...(entity.price !== null && { price: Number(entity.price) }),
            ...(entity.unit && { unit: entity.unit }),
            isActive: entity.isActive,
            ...(productDetails && { productDetails }),
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
