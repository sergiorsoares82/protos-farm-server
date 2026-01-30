export interface CreateWorkLocationTypeDTO {
  code: string;
  name: string;
  isTalhao: boolean;
}

export interface UpdateWorkLocationTypeDTO {
  code?: string;
  name?: string;
  isActive?: boolean;
}
