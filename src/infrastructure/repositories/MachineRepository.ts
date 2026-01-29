import { Repository } from 'typeorm';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import { Machine } from '../../domain/entities/Machine.js';
import { MachineEntity } from '../database/entities/MachineEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class MachineRepository implements IMachineRepository {
  private repo: Repository<MachineEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(MachineEntity);
  }

  async findAll(tenantId: string): Promise<Machine[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Machine | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(machine: Machine): Promise<Machine> {
    const entity = new MachineEntity();
    (entity as any).id = machine.getId();
    entity.tenantId = machine.getTenantId();
    entity.name = machine.getName();
    entity.machineTypeId = machine.getMachineTypeId();
    entity.isActive = machine.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: MachineEntity): Machine {
    return new Machine({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      machineTypeId: entity.machineTypeId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
