import { CostCenterType } from '../../domain/enums/CostCenterType.js';
import { CostCenterKind } from '../../domain/enums/CostCenterKind.js';

export interface CreateCostCenterDTO {
    code: string;
    name?: string;
    description: string;
    kind?: CostCenterKind;
    type: CostCenterType;
    categoryId?: string;
    assetId?: string;
    activityTypeId?: string;
    acquisitionDate?: Date;
    acquisitionValue?: number;
    currentValue?: number;
}

export interface UpdateCostCenterDTO {
    code?: string;
    name?: string;
    description?: string;
    kind?: CostCenterKind;
    type?: CostCenterType;
    categoryId?: string;
    assetId?: string;
    activityTypeId?: string;
    acquisitionDate?: Date;
    acquisitionValue?: number;
    currentValue?: number;
    isActive?: boolean;
}

export interface CreateMachineWithCostCenterDTO {
    // Cost Center data
    code: string;
    name: string;
    description: string;
    type: CostCenterType;
    categoryId?: string;
    activityTypeId?: string;
    acquisitionDate?: Date;
    acquisitionValue?: number;
    
    // Machine specific data
    machineTypeId: string;
    brand?: string;
    model?: string;
    serialNumber?: string;
    horimeterInitial?: number;
    powerHp?: number;
    fuelType?: string;
}
