import { CostCenterType } from '../../domain/enums/CostCenterType.js';

export interface CreateCostCenterDTO {
    code: string;
    description: string;
    type: CostCenterType;
    categoryId?: string;
    assetId?: string;
}

export interface UpdateCostCenterDTO {
    code?: string;
    description?: string;
    type?: CostCenterType;
    categoryId?: string;
    assetId?: string;
    isActive?: boolean;
}
