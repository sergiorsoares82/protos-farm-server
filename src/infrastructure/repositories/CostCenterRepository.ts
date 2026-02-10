import { IsNull, Repository } from 'typeorm';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import { CostCenter } from '../../domain/entities/CostCenter.js';
import { CostCenterType } from '../../domain/enums/CostCenterType.js';
import { CostCenterKind } from '../../domain/enums/CostCenterKind.js';
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
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });

        return entities.map(this.toDomain);
    }

    async findById(id: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { id, tenantId },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCode(code: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { code, tenantId },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByAssetId(assetId: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { tenantId, asset: { id: assetId } },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCategoryCode(tenantId: string, categoryCode: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId, isActive: true, category: { code: categoryCode } },
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });
        return entities.map(this.toDomain);
    }

    async findByKindCategoryId(tenantId: string, kindCategoryId: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId, kindCategoryId },
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });
        return entities.map(this.toDomain);
    }

    async findByParentId(tenantId: string, parentId: string | null): Promise<CostCenter[]> {
        const where = parentId == null
            ? { tenantId, parentId: IsNull() }
            : { tenantId, parentId };
        const entities = await this.repo.find({
            where,
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });
        return entities.map(this.toDomain);
    }

    async findRoots(tenantId: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId, parentId: IsNull() },
            order: { createdAt: 'DESC' },
            relations: ['category', 'asset', 'activityType', 'kindCategory'],
        });
        return entities.map(this.toDomain);
    }

    async countByKindCategoryId(tenantId: string, kindCategoryId: string): Promise<number> {
        return this.repo.count({ where: { tenantId, kindCategoryId } });
    }

    async save(costCenter: CostCenter): Promise<CostCenter> {
        const entity = new CostCenterEntity();
        entity.id = costCenter.getId();
        entity.tenantId = costCenter.getTenantId();
        entity.code = costCenter.getCode();
        entity.name = costCenter.getName() ?? null;
        entity.description = costCenter.getDescription();
        entity.kind = costCenter.getKind();
        entity.kindCategoryId = costCenter.getKindCategoryId() ?? null;
        entity.type = costCenter.getType();
        entity.hasTechnicalData = costCenter.getHasTechnicalData();
        entity.acquisitionDate = costCenter.getAcquisitionDate() ?? null;
        entity.acquisitionValue = costCenter.getAcquisitionValue() ?? null;
        entity.currentValue = costCenter.getCurrentValue() ?? null;
        entity.parentId = costCenter.getParentId() ?? null;
        entity.relatedFieldId = costCenter.getRelatedFieldId() ?? null;
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
            name: entity.name ?? undefined,
            description: entity.description,
            kind: (entity.kind as CostCenterKind) || CostCenterKind.GENERAL,
            kindCategoryId: entity.kindCategoryId ?? (entity as any).kindCategory?.id ?? undefined,
            type: entity.type as CostCenterType,
            hasTechnicalData: entity.hasTechnicalData || false,
            acquisitionDate: entity.acquisitionDate ?? undefined,
            acquisitionValue: entity.acquisitionValue ? Number(entity.acquisitionValue) : undefined,
            currentValue: entity.currentValue ? Number(entity.currentValue) : undefined,
            categoryId: (entity as any).category?.id ?? undefined,
            assetId: (entity as any).asset?.id ?? undefined,
            activityTypeId: (entity as any).activityType?.id ?? undefined,
            parentId: entity.parentId ?? undefined,
            relatedFieldId: entity.relatedFieldId ?? undefined,
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
