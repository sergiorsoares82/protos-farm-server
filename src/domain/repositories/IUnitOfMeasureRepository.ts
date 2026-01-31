import type { UnitOfMeasure } from '../entities/UnitOfMeasure.js';

export interface IUnitOfMeasureRepository {
  /** Units visible to tenant: system (tenant_id null) + tenant's own. */
  findAll(tenantId: string): Promise<UnitOfMeasure[]>;
  findById(id: string, tenantId: string): Promise<UnitOfMeasure | null>;
  /** Load by id only (for permission check: super admin can edit any). */
  findByIdAny(id: string): Promise<UnitOfMeasure | null>;
  findByCode(code: string, tenantId: string): Promise<UnitOfMeasure | null>;
  /** System-only: tenant_id IS NULL. */
  findSystemByCode(code: string): Promise<UnitOfMeasure | null>;
  save(unit: UnitOfMeasure): Promise<UnitOfMeasure>;
  delete(id: string, tenantId: string | null): Promise<void>;
}
