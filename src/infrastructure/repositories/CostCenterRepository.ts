import { Repository } from 'typeorm';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import { CostCenter } from '../../domain/entities/CostCenter.js';
import { CostCenterType } from '../../domain/enums/CostCenterType.js';
import { CostCenterEntity } from '../database/entities/CostCenterEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class CostCenterRepository implements ICostCenterRepository {
    private repo: Repository<CostCenterEntity>;

    constructor() {
        // Use entity name so we resolve the same metadata as DataSource (avoids bundle reference mismatch on Vercel)
        this.repo = AppDataSource.getRepository('CostCenterEntity') as Repository<CostCenterEntity>;
    }

    async findAll(tenantId: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType'],
        });

        return entities.map(this.toDomain);
    }

    async findById(id: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { id, tenantId },
            relations: ['category', 'asset', 'activityType'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCode(code: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { code, tenantId },
            relations: ['category', 'asset', 'activityType'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByAssetId(assetId: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { tenantId, asset: { id: assetId } },
            relations: ['category', 'asset', 'activityType'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCategoryCode(tenantId: string, categoryCode: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId, isActive: true, category: { code: categoryCode } },
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType'],
        });
        return entities.map(this.toDomain);
    }

    async save(costCenter: CostCenter): Promise<CostCenter> {
        const entity = new CostCenterEntity();
        entity.id = costCenter.getId();
        entity.tenantId = costCenter.getTenantId();
        entity.code = costCenter.getCode();
        entity.description = costCenter.getDescription();
        entity.type = costCenter.getType();
        entity.isActive = costCenter.getIsActive();
        const categoryId = costCenter.getCategoryId();
        if (categoryId) {
            (entity as any).category = { id: categoryId };
        } else {
            (entity as any).category = null;
        }
        const assetId = costCenter.getAssetId();
        if (assetId) {
            (entity as any).asset = { id: assetId };
        } else {
            (entity as any).asset = null;
        }
        const activityTypeId = costCenter.getActivityTypeId();
        if (activityTypeId) {
            (entity as any).activityType = { id: activityTypeId };
        } else {
            (entity as any).activityType = null;
        }

        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        await this.repo.delete({ id, tenantId });
    }

    private toDomain(entity: CostCenterEntity): CostCenter {
        return new CostCenter({
            id: entity.id,
            tenantId: entity.tenantId,
            code: entity.code,
            description: entity.description,
            type: entity.type as CostCenterType,
            categoryId: (entity as any).category?.id ?? undefined,
            assetId: (entity as any).asset?.id ?? undefined,
            activityTypeId: (entity as any).activityType?.id ?? undefined,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
