import type { WorkLocationType } from '../entities/WorkLocationType.js';

export interface IWorkLocationTypeRepository {
  findAll(tenantId: string): Promise<WorkLocationType[]>;
  findById(id: string, tenantId: string): Promise<WorkLocationType | null>;
  findByCode(code: string, tenantId: string): Promise<WorkLocationType | null>;
  save(type: WorkLocationType): Promise<WorkLocationType>;
  delete(id: string, tenantId: string): Promise<void>;
}
