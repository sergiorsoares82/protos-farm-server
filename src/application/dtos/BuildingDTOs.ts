export interface CreateBuildingDTO {
  costCenterId: string;
  areaM2?: number;
  landRegistry?: string;
  locationDetails?: string;
  constructionDate?: Date;
}

export interface UpdateBuildingDTO {
  areaM2?: number;
  landRegistry?: string;
  locationDetails?: string;
  constructionDate?: Date;
  isActive?: boolean;
}

export interface CreateBuildingWithCostCenterDTO {
  // Cost Center data
  code: string;
  name: string;
  description: string;
  type: string; // CostCenterType
  categoryId?: string;
  activityTypeId?: string;
  acquisitionDate?: Date;
  acquisitionValue?: number;
  
  // Building specific data
  areaM2?: number;
  landRegistry?: string;
  locationDetails?: string;
  constructionDate?: Date;
}
