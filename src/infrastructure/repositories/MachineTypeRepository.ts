import { Repository } from 'typeorm';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import { MachineType } from '../../domain/entities/MachineType.js';
import { MachineTypeEntity } from '../database/entities/MachineTypeEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class MachineTypeRepository implements IMachineTypeRepository {
  private repo: Repository<MachineTypeEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(MachineTypeEntity);
  }

  async findAll(tenantId: string): Promise<MachineType[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { code: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<MachineType | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCode(code: string, tenantId: string): Promise<MachineType | null> {
    const entity = await this.repo.findOne({ where: { code, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(machineType: MachineType): Promise<MachineType> {
    const entity = new MachineTypeEntity();
    (entity as any).id = machineType.getId();
    entity.tenantId = machineType.getTenantId();
    entity.code = machineType.getCode();
    entity.name = machineType.getName();
    entity.description = machineType.getDescription() ?? null;
    entity.isActive = machineType.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: MachineTypeEntity): MachineType {
    return new MachineType({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      description: entity.description ?? undefined,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
