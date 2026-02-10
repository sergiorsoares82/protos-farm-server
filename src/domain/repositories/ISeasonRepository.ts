import type { Season } from '../entities/Season.js';

export interface ISeasonRepository {
  findAll(tenantId: string): Promise<Season[]>;
  findById(id: string, tenantId: string): Promise<Season | null>;
  findByName(name: string, tenantId: string): Promise<Season | null>;
  findContainingDate(tenantId: string, date: string): Promise<Season | null>;
  save(season: Season): Promise<Season>;
  delete(id: string, tenantId: string): Promise<void>;
}

