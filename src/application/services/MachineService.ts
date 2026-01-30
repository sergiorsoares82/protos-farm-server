import { Machine } from '../../domain/entities/Machine.js';
import type { IMachineRepository } from '../../domain/repositories/IMachineRepository.js';
import type { IMachineTypeRepository } from '../../domain/repositories/IMachineTypeRepository.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import { AssetKind } from '../../domain/enums/AssetKind.js';
import type { CreateMachineDTO, UpdateMachineDTO } from '../dtos/MachineDTOs.js';

export class MachineService {
  constructor(
    private readonly machineRepository: IMachineRepository,
    private readonly machineTypeRepository: IMachineTypeRepository,
    private readonly assetRepository?: IAssetRepository,
  ) {}

  async createMachine(tenantId: string, data: CreateMachineDTO): Promise<Machine> {
    const typeExists = await this.machineTypeRepository.findById(data.machineTypeId, tenantId);
    if (!typeExists) {
      throw new Error('Machine type not found');
    }

    if (data.assetId && this.assetRepository) {
      const asset = await this.assetRepository.findById(data.assetId, tenantId);
      if (!asset) {
        throw new Error('Asset not found');
      }
      const kind = asset.getAssetKind();
      if (kind !== AssetKind.MACHINE && kind !== AssetKind.IMPLEMENT) {
        throw new Error('Asset must be of kind MACHINE or IMPLEMENT to link to a machine');
      }
    }

    const machine = Machine.create(
      tenantId,
      data.name,
      data.machineTypeId,
      data.assetId,
    );
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

    if (data.assetId !== undefined && data.assetId && this.assetRepository) {
      const asset = await this.assetRepository.findById(data.assetId, tenantId);
      if (!asset) {
        throw new Error('Asset not found');
      }
      const kind = asset.getAssetKind();
      if (kind !== AssetKind.MACHINE && kind !== AssetKind.IMPLEMENT) {
        throw new Error('Asset must be of kind MACHINE or IMPLEMENT to link to a machine');
      }
    }

    if (
      data.name !== undefined ||
      data.machineTypeId !== undefined ||
      data.assetId !== undefined
    ) {
      const newAssetId = data.assetId !== undefined ? data.assetId : machine.getAssetId();
      machine.update(
        data.name ?? machine.getName(),
        data.machineTypeId ?? machine.getMachineTypeId(),
        newAssetId,
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
