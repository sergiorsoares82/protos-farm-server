import type { WorkLocationType } from '../entities/WorkLocationType.js';

export interface IWorkLocationTypeRepository {
  /** Types visible to tenant: system (tenant_id null) + tenant's own. */
  findAll(tenantId: string): Promise<WorkLocationType[]>;
  findById(id: string, tenantId: string): Promise<WorkLocationType | null>;
  findByCode(code: string, tenantId: string): Promise<WorkLocationType | null>;
  /** System-only: tenant_id IS NULL. Used by seed and ensureDefaultTypes. */
  findSystemByCode(code: string): Promise<WorkLocationType | null>;
  save(type: WorkLocationType): Promise<WorkLocationType>;
  delete(id: string, tenantId: string): Promise<void>;
}
