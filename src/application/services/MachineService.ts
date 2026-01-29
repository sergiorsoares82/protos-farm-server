import { Machine } from '../../domain/entities/Machine.js';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import type { CreateMachineDTO, UpdateMachineDTO } from '../dtos/MachineDTOs.js';

export class MachineService {
  constructor(
    private readonly machineRepository: IMachineRepository,
    private readonly machineTypeRepository: IMachineTypeRepository,
  ) {}

  async createMachine(tenantId: string, data: CreateMachineDTO): Promise<Machine> {
    const typeExists = await this.machineTypeRepository.findById(data.machineTypeId, tenantId);
    if (!typeExists) {
      throw new Error('Machine type not found');
    }

    const machine = Machine.create(tenantId, data.name, data.machineTypeId);
    return this.machineRepository.save(machine);
  }

  async getMachine(tenantId: string, id: string): Promise<Machine> {
    const machine = await this.machineRepository.findById(id, tenantId);
    if (!machine) {
      throw new Error('Machine not found');
    }
    return machine;
  }

  async updateMachine(tenantId: string, id: string, data: UpdateMachineDTO): Promise<Machine> {
    const machine = await this.getMachine(tenantId, id);

    if (data.machineTypeId) {
      const typeExists = await this.machineTypeRepository.findById(data.machineTypeId, tenantId);
      if (!typeExists) {
        throw new Error('Machine type not found');
      }
    }

    if (data.name !== undefined || data.machineTypeId !== undefined) {
      machine.update(
        data.name ?? machine.getName(),
        data.machineTypeId ?? machine.getMachineTypeId(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        machine.activate();
      } else {
        machine.deactivate();
      }
    }

    return this.machineRepository.save(machine);
  }

  async deleteMachine(tenantId: string, id: string): Promise<void> {
    await this.machineRepository.delete(id, tenantId);
  }

  async getAllMachines(tenantId: string): Promise<Machine[]> {
    return this.machineRepository.findAll(tenantId);
  }
}
