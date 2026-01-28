export interface CreateSeasonDTO {
  name: string;
  startDate: string; // ISO date string (yyyy-MM-dd)
  endDate: string;   // ISO date string (yyyy-MM-dd)
}

export interface UpdateSeasonDTO {
  name?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

