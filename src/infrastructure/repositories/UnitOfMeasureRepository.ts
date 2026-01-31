import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IUnitOfMeasureRepository } from '../../domain/repositories/IUnitOfMeasureRepository.js';
import { UnitOfMeasure } from '../../domain/entities/UnitOfMeasure.js';
import { UnitOfMeasureEntity } from '../database/entities/UnitOfMeasureEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class UnitOfMeasureRepository implements IUnitOfMeasureRepository {
  private repo: Repository<UnitOfMeasureEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(UnitOfMeasureEntity);
  }

  async findAll(tenantId: string): Promise<UnitOfMeasure[]> {
    const entities = await this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
      order: { code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<UnitOfMeasure | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdAny(id: string): Promise<UnitOfMeasure | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<UnitOfMeasure | null> {
    const entities = await this.repo.find({
      where: [{ code, tenantId: IsNull() }, { code, tenantId }],
      order: { tenantId: 'ASC' },
      take: 1,
    });
    const entity = entities[0] ?? null;
    return entity ? this.toDomain(entity) : null;
  }

  async findSystemByCode(code: string): Promise<UnitOfMeasure | null> {
    const entity = await this.repo.findOne({
      where: { code, tenantId: IsNull() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(unit: UnitOfMeasure): Promise<UnitOfMeasure> {
    const entity = new UnitOfMeasureEntity();
    (entity as any).id = unit.getId();
    entity.tenantId = unit.getTenantId();
    entity.code = unit.getCode();
    entity.name = unit.getName();
    entity.isSystem = unit.getIsSystem();
    entity.isActive = unit.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string | null): Promise<void> {
    const where = tenantId === null
      ? { id, tenantId: IsNull() }
      : { id, tenantId };
    await this.repo.delete(where as any);
  }

  private toDomain(entity: UnitOfMeasureEntity): UnitOfMeasure {
    return new UnitOfMeasure({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      isSystem: entity.isSystem,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
