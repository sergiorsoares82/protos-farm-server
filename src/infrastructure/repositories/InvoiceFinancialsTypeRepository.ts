import { IsNull } from 'typeorm';
import { Repository } from 'typeorm';
import type { IInvoiceFinancialsTypeRepository } from '../../domain/repositories/IInvoiceFinancialsTypeRepository.js';
import { InvoiceFinancialsType } from '../../domain/entities/InvoiceFinancialsType.js';
import { InvoiceFinancialsTypeEntity } from '../database/entities/InvoiceFinancialsTypeEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class InvoiceFinancialsTypeRepository implements IInvoiceFinancialsTypeRepository {
  private repo: Repository<InvoiceFinancialsTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(InvoiceFinancialsTypeEntity);
  }

  async findAll(tenantId: string | null): Promise<InvoiceFinancialsType[]> {
    const where =
      tenantId != null
        ? [{ tenantId: IsNull() }, { tenantId }]
        : [{ tenantId: IsNull() }];
    const entities = await this.repo.find({
      where,
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<InvoiceFinancialsType | null> {
    const entity = await this.repo.findOne({
      where: [{ id, tenantId: IsNull() }, { id, tenantId }],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIdAny(id: string): Promise<InvoiceFinancialsType | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findSystemByName(name: string): Promise<InvoiceFinancialsType | null> {
    const entities = await this.repo.find({
      where: { tenantId: IsNull() },
    });
    const normalized = name.trim().toLowerCase();
    const match = entities.find((e) => e.name.trim().toLowerCase() === normalized);
    return match ? this.toDomain(match) : null;
  }

  async findByName(tenantId: string, name: string): Promise<InvoiceFinancialsType | null> {
    const entities = await this.repo.find({
      where: [{ tenantId: IsNull() }, { tenantId }],
    });
    const normalized = name.trim().toLowerCase();
    const match = entities.find((e) => e.name.trim().toLowerCase() === normalized);
    return match ? this.toDomain(match) : null;
  }

  async save(type: InvoiceFinancialsType): Promise<InvoiceFinancialsType> {
    const entity = new InvoiceFinancialsTypeEntity();
    (entity as any).id = type.getId();
    entity.tenantId = type.getTenantId();
    entity.name = type.getName();
    entity.isSystem = type.getIsSystem();
    entity.isActive = type.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string | null): Promise<void> {
    const where =
      tenantId != null
        ? { id, tenantId }
        : { id, tenantId: IsNull() };
    await this.repo.delete(where);
  }

  private toDomain(entity: InvoiceFinancialsTypeEntity): InvoiceFinancialsType {
    return new InvoiceFinancialsType({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      isSystem: entity.isSystem,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
