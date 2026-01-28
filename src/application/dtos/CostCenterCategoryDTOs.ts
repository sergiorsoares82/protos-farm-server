export interface CreateCostCenterCategoryDTO {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateCostCenterCategoryDTO {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

