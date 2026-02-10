import type { CostCenterKindCategoryType } from '../../domain/enums/CostCenterKindCategoryType.js';

export interface CreateCostCenterKindCategoryDTO {
  code: string;
  name: string;
  type: CostCenterKindCategoryType;
  sortOrder?: number;
}

export interface UpdateCostCenterKindCategoryDTO {
  code?: string;
  name?: string;
  type?: CostCenterKindCategoryType;
  sortOrder?: number;
  isActive?: boolean;
}
