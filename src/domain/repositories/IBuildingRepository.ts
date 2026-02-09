import type { Building } from '../entities/Building.js';

export interface IBuildingRepository {
  findAll(tenantId: string): Promise<Building[]>;
  findById(id: string, tenantId: string): Promise<Building | null>;
  findByCostCenterId(costCenterId: string, tenantId: string): Promise<Building | null>;
  save(building: Building): Promise<Building>;
  delete(id: string, tenantId: string): Promise<void>;
}
