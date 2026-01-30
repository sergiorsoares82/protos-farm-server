import type { StockMovementDirection } from '../../domain/enums/StockMovementDirection.js';

export interface CreateStockMovementTypeDTO {
  code: string;
  name: string;
  direction: StockMovementDirection;
}

export interface UpdateStockMovementTypeDTO {
  code?: string;
  name?: string;
  direction?: StockMovementDirection;
  isActive?: boolean;
}
