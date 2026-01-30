import type { StockMovementType } from '../entities/StockMovementType.js';

export interface IStockMovementTypeRepository {
  /** Types visible to tenant: system (tenant_id null) + tenant's own. */
  findAll(tenantId: string): Promise<StockMovementType[]>;
  findById(id: string, tenantId: string): Promise<StockMovementType | null>;
  findByCode(code: string, tenantId: string): Promise<StockMovementType | null>;
  /** System-only: tenant_id IS NULL. Used by seed. */
  findSystemByCode(code: string): Promise<StockMovementType | null>;
  save(type: StockMovementType): Promise<StockMovementType>;
  delete(id: string, tenantId: string): Promise<void>;
}
