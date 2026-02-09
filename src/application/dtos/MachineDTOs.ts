export interface CreateMachineDTO {
  costCenterId?: string;
  machineTypeId: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  horimeterInitial?: number;
  horimeterCurrent?: number;
  powerHp?: number;
  fuelType?: string;
}

export interface UpdateMachineDTO {
  machineTypeId?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  horimeterCurrent?: number;
  powerHp?: number;
  fuelType?: string;
  isActive?: boolean;
}
