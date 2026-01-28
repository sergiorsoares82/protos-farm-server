import { Repository } from 'typeorm';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import { CostCenter } from '../../domain/entities/CostCenter.js';
import { CostCenterType } from '../../domain/enums/CostCenterType.js';
import { CostCenterEntity } from '../database/entities/CostCenterEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class CostCenterRepository implements ICostCenterRepository {
    private repo: Repository<CostCenterEntity>;

    constructor() {
        // Use entity class directly; this matches metadata registered in AppDataSource.entities
        this.repo = AppDataSource.getRepository(CostCenterEntity);
    }

    async findAll(tenantId: string): Promise<CostCenter[]> {
        const entities = await this.repo.find({
            where: { tenantId },
            order: { createdAt: 'DESC' },
        });

        return entities.map(this.toDomain);
    }

    async findById(id: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { id, tenantId },
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCode(code: string, tenantId: string): Promise<CostCenter | null> {
        const entity = await this.repo.findOne({
            where: { code, tenantId },
        });

        if (!entity) return null;
        return this.toDomain(entity);
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
            // Associate by reference; TypeORM will use the foreign key column `category_id`
            (entity as any).category = { id: categoryId };
        } else {
            (entity as any).category = null;
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
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
