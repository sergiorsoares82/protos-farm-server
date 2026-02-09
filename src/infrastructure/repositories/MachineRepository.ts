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
      order: { createdAt: 'DESC' },
      relations: ['costCenter'],
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Machine | null> {
    const entity = await this.repo.findOne({ 
      where: { id, tenantId },
      relations: ['costCenter'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(machine: Machine): Promise<Machine> {
    const entity = new MachineEntity();
    (entity as any).id = machine.getId();
    entity.tenantId = machine.getTenantId();
    entity.costCenterId = machine.getCostCenterId() ?? null;
    entity.machineTypeId = machine.getMachineTypeId();
    entity.brand = machine.getBrand() ?? null;
    entity.model = machine.getModel() ?? null;
    entity.serialNumber = machine.getSerialNumber() ?? null;
    entity.horimeterInitial = machine.getHorimeterInitial();
    entity.horimeterCurrent = machine.getHorimeterCurrent() ?? null;
    entity.powerHp = machine.getPowerHp() ?? null;
    entity.fuelType = machine.getFuelType() ?? null;
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
      costCenterId: entity.costCenterId ?? undefined,
      machineTypeId: entity.machineTypeId,
      brand: entity.brand ?? undefined,
      model: entity.model ?? undefined,
      serialNumber: entity.serialNumber ?? undefined,
      horimeterInitial: entity.horimeterInitial,
      horimeterCurrent: entity.horimeterCurrent ?? undefined,
      powerHp: entity.powerHp ?? undefined,
      fuelType: entity.fuelType ?? undefined,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
