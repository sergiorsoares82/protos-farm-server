import { CostCenterType } from '../../domain/enums/CostCenterType.js';

export interface CreateCostCenterDTO {
    code: string;
    description: string;
    type: CostCenterType;
    categoryId?: string;
    assetId?: string;
    activityTypeId?: string;
}

export interface UpdateCostCenterDTO {
    code?: string;
    description?: string;
    type?: CostCenterType;
    categoryId?: string;
    assetId?: string;
    activityTypeId?: string;
    isActive?: boolean;
}
