import type { CostCenterKindCategory } from '../entities/CostCenterKindCategory.js';

export interface ICostCenterKindCategoryRepository {
  findAllByTenant(tenantId: string): Promise<CostCenterKindCategory[]>;
  findById(id: string, tenantId: string): Promise<CostCenterKindCategory | null>;
  findByCode(code: string, tenantId: string): Promise<CostCenterKindCategory | null>;
  save(category: CostCenterKindCategory): Promise<CostCenterKindCategory>;
  delete(id: string, tenantId: string): Promise<void>;
}
