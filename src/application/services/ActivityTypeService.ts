import { ActivityType } from '../../domain/entities/ActivityType.js';
import type { IActivityTypeRepository } from '../../domain/repositories/IActivityTypeRepository.js';
import type {
  CreateActivityTypeDTO,
  UpdateActivityTypeDTO,
} from '../dtos/ActivityTypeDTOs.js';

export class ActivityTypeService {
  constructor(private readonly activityTypeRepository: IActivityTypeRepository) {}

  async create(
    tenantId: string | null,
    data: CreateActivityTypeDTO,
    isSuperAdmin: boolean,
  ): Promise<ActivityType> {
    const effectiveTenantId = isSuperAdmin ? (data.tenantId ?? tenantId) : tenantId;
    if (effectiveTenantId == null && !isSuperAdmin) {
      throw new Error('Organization context is required to create an activity type');
    }
    const name = data.name?.trim();
    if (!name) {
      throw new Error('Name is required');
    }
    const activityType = ActivityType.create(effectiveTenantId, name);
    return this.activityTypeRepository.save(activityType);
  }

  async getById(tenantId: string | null, id: string): Promise<ActivityType> {
    const activityType =
      tenantId != null
        ? await this.activityTypeRepository.findById(id, tenantId)
        : await this.activityTypeRepository.findByIdAny(id);
    if (!activityType) {
      throw new Error('Activity type not found');
    }
    return activityType;
  }

  async update(
    tenantId: string | null,
    id: string,
    data: UpdateActivityTypeDTO,
    isSuperAdmin: boolean,
  ): Promise<ActivityType> {
    const activityType =
      tenantId != null
        ? await this.activityTypeRepository.findById(id, tenantId)
        : await this.activityTypeRepository.findByIdAny(id);
    if (!activityType) {
      throw new Error('Activity type not found');
    }
    if (!isSuperAdmin && activityType.getIsSystem()) {
      throw new Error('System activity type cannot be edited by organization admin');
    }
    if (!isSuperAdmin && activityType.getTenantId() !== tenantId) {
      throw new Error('Activity type not found');
    }

    if (data.name !== undefined) {
      activityType.update(data.name);
    }
    if (data.isActive !== undefined) {
      if (data.isActive) {
        activityType.activate();
      } else {
        activityType.deactivate();
      }
    }

    return this.activityTypeRepository.save(activityType);
  }

  async delete(
    tenantId: string | null,
    id: string,
    isSuperAdmin: boolean,
  ): Promise<void> {
    const activityType =
      tenantId != null
        ? await this.activityTypeRepository.findById(id, tenantId)
        : await this.activityTypeRepository.findByIdAny(id);
    if (!activityType) {
      throw new Error('Activity type not found');
    }
    if (activityType.getIsSystem() && !isSuperAdmin) {
      throw new Error('System activity type cannot be deleted');
    }
    if (!isSuperAdmin && activityType.getTenantId() !== tenantId) {
      throw new Error('Activity type not found');
    }
    await this.activityTypeRepository.delete(id, activityType.getTenantId());
  }

  async getAll(tenantId: string | null): Promise<ActivityType[]> {
    return this.activityTypeRepository.findAll(tenantId);
  }
}
