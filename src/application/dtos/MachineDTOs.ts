export interface CreateMachineDTO {
  name: string;
  machineTypeId: string;
}

export interface UpdateMachineDTO {
  name?: string;
  machineTypeId?: string;
  isActive?: boolean;
}
