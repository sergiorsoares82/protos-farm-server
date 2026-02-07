import type { ActivityType } from '../entities/ActivityType.js';

export interface IActivityTypeRepository {
  /** If tenantId is null, returns only system types. Otherwise system + tenant's types. */
  findAll(tenantId: string | null): Promise<ActivityType[]>;
  findById(id: string, tenantId: string): Promise<ActivityType | null>;
  findByIdAny(id: string): Promise<ActivityType | null>;
  save(activityType: ActivityType): Promise<ActivityType>;
  /** When tenantId is null, deletes system type (id must match). */
  delete(id: string, tenantId: string | null): Promise<void>;
}
