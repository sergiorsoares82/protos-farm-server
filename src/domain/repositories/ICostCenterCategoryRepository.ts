import type { CostCenterCategory } from '../entities/CostCenterCategory.js';

export interface ICostCenterCategoryRepository {
  findAll(tenantId: string): Promise<CostCenterCategory[]>;
  findById(id: string, tenantId: string): Promise<CostCenterCategory | null>;
  findByCode(code: string, tenantId: string): Promise<CostCenterCategory | null>;
  save(category: CostCenterCategory): Promise<CostCenterCategory>;
  delete(id: string, tenantId: string): Promise<void>;
}

