export interface CreateFieldDTO {
  code: string;
  name: string;
  areaHectares: number;
}

export interface UpdateFieldDTO {
  code?: string;
  name?: string;
  areaHectares?: number;
  isActive?: boolean;
}

