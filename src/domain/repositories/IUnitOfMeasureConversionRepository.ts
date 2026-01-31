import type { UnitOfMeasureConversion } from '../entities/UnitOfMeasureConversion.js';

export interface IUnitOfMeasureConversionRepository {
  /** Conversions visible to tenant: system (tenant_id null) + tenant's own. */
  findAll(tenantId: string): Promise<UnitOfMeasureConversion[]>;
  findById(id: string, tenantId: string): Promise<UnitOfMeasureConversion | null>;
  /** Load by id only (for permission check). */
  findByIdAny(id: string): Promise<UnitOfMeasureConversion | null>;
  /** Find conversion from A to B visible to tenant (system or tenant's). */
  findByFromAndTo(
    fromUnitId: string,
    toUnitId: string,
    tenantId: string,
  ): Promise<UnitOfMeasureConversion | null>;
  /** Find conversion in scope: scopeTenantId null = system only; set = that org only. */
  findByFromAndToInScope(
    fromUnitId: string,
    toUnitId: string,
    scopeTenantId: string | null,
  ): Promise<UnitOfMeasureConversion | null>;
  save(conversion: UnitOfMeasureConversion): Promise<UnitOfMeasureConversion>;
  delete(id: string, tenantId: string | null): Promise<void>;
}
