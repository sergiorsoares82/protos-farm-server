import type { WorkLocation } from '../entities/WorkLocation.js';

export interface IWorkLocationRepository {
  findAll(tenantId: string): Promise<WorkLocation[]>;
  findById(id: string, tenantId: string): Promise<WorkLocation | null>;
  findByCode(code: string, tenantId: string): Promise<WorkLocation | null>;
  save(workLocation: WorkLocation): Promise<WorkLocation>;
  delete(id: string, tenantId: string): Promise<void>;
  backfillTypeIds?(tenantId: string, typeIdByCode: Map<string, string>): Promise<void>;
}
