export interface CreateStockMovementDTO {
  movementDate: string; // ISO date (yyyy-MM-dd)
  stockMovementTypeId: string;
  itemId: string;
  unit: string;
  quantity: number;
  workLocationId?: string | null;
  seasonId?: string | null;
  costCenterId?: string | null;
  managementAccountId?: string | null;
}

export interface UpdateStockMovementDTO {
  movementDate?: string;
  stockMovementTypeId?: string;
  itemId?: string;
  unit?: string;
  quantity?: number;
  workLocationId?: string | null;
  seasonId?: string | null;
  costCenterId?: string | null;
  managementAccountId?: string | null;
}
