import type { Machine } from '../entities/Machine.js';

export interface IMachineRepository {
  findAll(tenantId: string): Promise<Machine[]>;
  findById(id: string, tenantId: string): Promise<Machine | null>;
  save(machine: Machine): Promise<Machine>;
  delete(id: string, tenantId: string): Promise<void>;
}
