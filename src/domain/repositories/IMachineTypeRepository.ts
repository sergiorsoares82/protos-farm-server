import type { MachineType } from '../entities/MachineType.js';

export interface IMachineTypeRepository {
  findAll(tenantId: string): Promise<MachineType[]>;
  findById(id: string, tenantId: string): Promise<MachineType | null>;
  findByCode(code: string, tenantId: string): Promise<MachineType | null>;
  save(machineType: MachineType): Promise<MachineType>;
  delete(id: string, tenantId: string): Promise<void>;
}
