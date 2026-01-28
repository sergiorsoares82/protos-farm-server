import { Repository } from 'typeorm';
import type { IManagementAccountRepository } from '../../domain/repositories/IManagementAccountRepository.js';
import { ManagementAccount } from '../../domain/entities/ManagementAccount.js';
import { AccountType } from '../../domain/enums/AccountType.js';
import { ManagementAccountEntity } from '../database/entities/ManagementAccountEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class ManagementAccountRepository implements IManagementAccountRepository {
    private repo: Repository<ManagementAccountEntity>;

    constructor() {
        // Use entity class directly; this matches metadata registered in AppDataSource.entities
        this.repo = AppDataSource.getRepository(ManagementAccountEntity);
    }

    async findAll(tenantId: string): Promise<ManagementAccount[]> {
        const entities = await this.repo.find({
            where: { tenantId },
            order: { code: 'ASC' }, // Sort by code for hierarchical view
            relations: ['categories'],
        });

        return entities.map(this.toDomain);
    }

    async findById(id: string, tenantId: string): Promise<ManagementAccount | null> {
        const entity = await this.repo.findOne({
            where: { id, tenantId },
            relations: ['categories'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCode(code: string, tenantId: string): Promise<ManagementAccount | null> {
        const entity = await this.repo.findOne({
            where: { code, tenantId },
            relations: ['categories'],
        });

        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByIds(ids: string[], tenantId: string): Promise<ManagementAccount[]> {
        if (ids.length === 0) return [];
        const entities = await this.repo.find({
            where: { tenantId, id: ids as any },
        });
        return entities.map(this.toDomain);
    }

    async save(account: ManagementAccount): Promise<ManagementAccount> {
        const entity = new ManagementAccountEntity();
        entity.id = account.getId();
        entity.tenantId = account.getTenantId();
        entity.code = account.getCode();
        entity.description = account.getDescription();
        entity.type = account.getType();
        entity.isActive = account.getIsActive();
        const categoryIds = account.getCategoryIds();
        (entity as any).categories = (categoryIds ?? []).map((id) => ({ id }));

        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        await this.repo.delete({ id, tenantId });
    }

    private toDomain(entity: ManagementAccountEntity): ManagementAccount {
        return new ManagementAccount({
            id: entity.id,
            tenantId: entity.tenantId,
            code: entity.code,
            description: entity.description,
            type: entity.type as AccountType,
            categoryIds: ((entity as any).categories ?? []).map((c: any) => c.id),
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
