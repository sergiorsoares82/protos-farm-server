import { Repository } from 'typeorm';
import type { IOperationRepository } from '../../domain/repositories/IOperationRepository.js';
import { Operation } from '../../domain/entities/Operation.js';
import { OperationEntity } from '../database/entities/OperationEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class OperationRepository implements IOperationRepository {
    private repo: Repository<OperationEntity>;

    constructor() {
        this.repo = AppDataSource.getRepository(OperationEntity);
    }

    async findAll(tenantId: string): Promise<Operation[]> {
        const entities = await this.repo.find({
            where: { tenantId },
            order: { code: 'ASC' },
            relations: ['activityTypes'],
        });
        return entities.map(this.toDomain);
    }

    async findById(id: string, tenantId: string): Promise<Operation | null> {
        const entity = await this.repo.findOne({
            where: { id, tenantId },
            relations: ['activityTypes'],
        });
        if (!entity) return null;
        return this.toDomain(entity);
    }

    async findByCode(code: string, tenantId: string): Promise<Operation | null> {
        const entity = await this.repo.findOne({
            where: { code, tenantId },
            relations: ['activityTypes'],
        });
        if (!entity) return null;
        return this.toDomain(entity);
    }

    async save(operation: Operation): Promise<Operation> {
        const entity = new OperationEntity();
        entity.id = operation.getId();
        entity.tenantId = operation.getTenantId();
        entity.code = operation.getCode();
        entity.description = operation.getDescription();
        entity.isActive = operation.getIsActive();
        const activityTypeIds = operation.getActivityTypeIds();
        (entity as any).activityTypes = (activityTypeIds ?? []).map((id) => ({ id }));

        const saved = await this.repo.save(entity);
        return this.toDomain(saved);
    }

    async delete(id: string, tenantId: string): Promise<void> {
        await this.repo.delete({ id, tenantId });
    }

    private toDomain(entity: OperationEntity): Operation {
        return new Operation({
            id: entity.id,
            tenantId: entity.tenantId,
            code: entity.code,
            description: entity.description,
            activityTypeIds: ((entity as any).activityTypes ?? []).map((a: { id: string }) => a.id),
            isActive: entity.isActive,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
        });
    }
}
