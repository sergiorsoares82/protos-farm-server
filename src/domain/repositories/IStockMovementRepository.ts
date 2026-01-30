import type { StockMovement } from '../entities/StockMovement.js';

export interface IStockMovementRepository {
  findAll(tenantId: string): Promise<StockMovement[]>;
  findById(id: string, tenantId: string): Promise<StockMovement | null>;
  save(movement: StockMovement): Promise<StockMovement>;
  delete(id: string, tenantId: string): Promise<void>;
}
