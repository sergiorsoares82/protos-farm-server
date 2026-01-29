export interface CreateMachineTypeDTO {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateMachineTypeDTO {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}
