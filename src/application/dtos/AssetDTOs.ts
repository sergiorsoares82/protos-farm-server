import type { AssetKind } from '../../domain/enums/AssetKind.js';
import type { CostCenterType } from '../../domain/enums/CostCenterType.js';

export interface CreateAssetDTO {
  name: string;
  code?: string;
  assetKind: AssetKind;
}

export interface UpdateAssetDTO {
  name?: string;
  code?: string;
  assetKind?: AssetKind;
  isActive?: boolean;
}

/** Creates Asset + Machine + CostCenter in one call (e.g. "Trator 01"). */
export interface CreateFullMachineDTO {
  name: string;
  code?: string;
  machineTypeId: string;
  costCenterCode?: string;
  costCenterDescription?: string;
  costCenterType: CostCenterType;
  costCenterCategoryId?: string;
}
