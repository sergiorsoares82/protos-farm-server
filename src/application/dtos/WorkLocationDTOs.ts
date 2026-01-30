export interface CreateWorkLocationDTO {
  code: string;
  name: string;
  typeId: string;
  areaHectares?: number | null;
  costCenterId?: string | null;
}

export interface UpdateWorkLocationDTO {
  code?: string;
  name?: string;
  typeId?: string;
  areaHectares?: number | null;
  costCenterId?: string | null;
  isActive?: boolean;
}
