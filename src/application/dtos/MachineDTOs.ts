export interface CreateMachineDTO {
  name: string;
  machineTypeId: string;
  assetId?: string;
}

export interface UpdateMachineDTO {
  name?: string;
  machineTypeId?: string;
  assetId?: string;
  isActive?: boolean;
}
