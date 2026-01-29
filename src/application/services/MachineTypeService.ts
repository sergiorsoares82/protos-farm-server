import { MachineType } from '../../domain/entities/MachineType.js';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import type {
  CreateMachineTypeDTO,
  UpdateMachineTypeDTO,
} from '../dtos/MachineTypeDTOs.js';

export class MachineTypeService {
  constructor(private readonly machineTypeRepository: IMachineTypeRepository) {}

  async createMachineType(
    tenantId: string,
    data: CreateMachineTypeDTO,
  ): Promise<MachineType> {
    const existing = await this.machineTypeRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Machine type with code '${data.code}' already exists`);
    }

    const machineType = MachineType.create(
      tenantId,
      data.code,
      data.name,
      data.description,
    );
    return this.machineTypeRepository.save(machineType);
  }

  async getMachineType(tenantId: string, id: string): Promise<MachineType> {
    const machineType = await this.machineTypeRepository.findById(id, tenantId);
    if (!machineType) {
      throw new Error('Machine type not found');
    }
    return machineType;
  }

  async updateMachineType(
    tenantId: string,
    id: string,
    data: UpdateMachineTypeDTO,
  ): Promise<MachineType> {
    const machineType = await this.getMachineType(tenantId, id);

    if (data.code && data.code !== machineType.getCode()) {
      const existing = await this.machineTypeRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Machine type with code '${data.code}' already exists`);
      }
    }

    if (data.code || data.name || data.description !== undefined) {
      machineType.update(
        data.code || machineType.getCode(),
        data.name || machineType.getName(),
        data.description !== undefined ? data.description : machineType.getDescription(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        machineType.activate();
      } else {
        machineType.deactivate();
      }
    }

    return this.machineTypeRepository.save(machineType);
  }

  async deleteMachineType(tenantId: string, id: string): Promise<void> {
    await this.machineTypeRepository.delete(id, tenantId);
  }

  async getAllMachineTypes(tenantId: string): Promise<MachineType[]> {
    return this.machineTypeRepository.findAll(tenantId);
  }
}
