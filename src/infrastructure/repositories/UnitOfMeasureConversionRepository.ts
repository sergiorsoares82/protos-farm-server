import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IUnitOfMeasureConversionRepository } from '../../domain/repositories/IUnitOfMeasureConversionRepository.js';
import { UnitOfMeasureConversion } from '../../domain/entities/UnitOfMeasureConversion.js';
import { UnitOfMeasureConversionEntity } from '../database/entities/UnitOfMeasureConversionEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class UnitOfMeasureConversionRepository implements IUnitOfMeasureConversionRepository {
  private repo: Repository<UnitOfMeasureConversionEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(UnitOfMeasureConversionEntity);
  }

  async findAll(tenantId: string): Promise<UnitOfMeasureConversion[]> {
    const entities = await this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
      order: { createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<UnitOfMeasureConversion | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdAny(id: string): Promise<UnitOfMeasureConversion | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByFromAndTo(
    fromUnitId: string,
    toUnitId: string,
    tenantId: string,
  ): Promise<UnitOfMeasureConversion | null> {
    const entities = await this.repo.find({
      where: [
        { fromUnitId, toUnitId, tenantId: IsNull() },
        { fromUnitId, toUnitId, tenantId },
      ],
      order: { tenantId: 'ASC' },
      take: 1,
    });
    const entity = entities[0] ?? null;
    return entity ? this.toDomain(entity) : null;
  }

  async findByFromAndToInScope(
    fromUnitId: string,
    toUnitId: string,
    scopeTenantId: string | null,
  ): Promise<UnitOfMeasureConversion | null> {
    const where = scopeTenantId === null
      ? { fromUnitId, toUnitId, tenantId: IsNull() }
      : { fromUnitId, toUnitId, tenantId: scopeTenantId };
    const entity = await this.repo.findOne({ where });
    return entity ? this.toDomain(entity) : null;
  }

  async save(conversion: UnitOfMeasureConversion): Promise<UnitOfMeasureConversion> {
    const entity = new UnitOfMeasureConversionEntity();
    (entity as any).id = conversion.getId();
    entity.tenantId = conversion.getTenantId();
    entity.fromUnitId = conversion.getFromUnitId();
    entity.toUnitId = conversion.getToUnitId();
    entity.factor = String(conversion.getFactor());
    entity.isSystem = conversion.getIsSystem();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string | null): Promise<void> {
    const where = tenantId === null
      ? { id, tenantId: IsNull() }
      : { id, tenantId };
    await this.repo.delete(where as any);
  }

  private toDomain(entity: UnitOfMeasureConversionEntity): UnitOfMeasureConversion {
    return new UnitOfMeasureConversion({
      id: entity.id,
      tenantId: entity.tenantId,
      fromUnitId: entity.fromUnitId,
      toUnitId: entity.toUnitId,
      factor: Number(entity.factor),
      isSystem: entity.isSystem,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
