import { UserRole } from '../../domain/enums/UserRole.js';
import { UnitOfMeasure } from '../../domain/entities/UnitOfMeasure.js';
import type { IUnitOfMeasureRepository } from '../../domain/repositories/IUnitOfMeasureRepository.js';
import type {
  CreateUnitOfMeasureDTO,
  UpdateUnitOfMeasureDTO,
} from '../dtos/UnitOfMeasureDTOs.js';

export class UnitOfMeasureService {
  constructor(private readonly unitOfMeasureRepository: IUnitOfMeasureRepository) {}

  /**
   * Create: SuperAdmin can create system (isSystem=true, tenantId=null) or for any org (tenantId).
   * OrgAdmin can create only for their own org (tenantId from context).
   */
  async create(
    userRole: UserRole,
    userTenantId: string,
    data: CreateUnitOfMeasureDTO,
  ): Promise<UnitOfMeasure> {
    let effectiveTenantId: string | null;
    let isSystem = false;

    if (data.isSystem === true) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Only Super Admin can create system-wide units of measure');
      }
      effectiveTenantId = null;
      isSystem = true;
    } else {
      effectiveTenantId = data.tenantId ?? userTenantId;
      if (userRole === UserRole.ORG_ADMIN && effectiveTenantId !== userTenantId) {
        throw new Error('Org Admin can only create units of measure for their own organization');
      }
    }

    const existing = effectiveTenantId
      ? await this.unitOfMeasureRepository.findByCode(data.code, effectiveTenantId)
      : await this.unitOfMeasureRepository.findSystemByCode(data.code);
    if (existing) {
      throw new Error(`Unit of measure with code '${data.code}' already exists`);
    }

    const unit = UnitOfMeasure.create(effectiveTenantId, data.code, data.name, isSystem);
    return this.unitOfMeasureRepository.save(unit);
  }

  async get(tenantId: string, id: string): Promise<UnitOfMeasure> {
    const unit = await this.unitOfMeasureRepository.findById(id, tenantId);
    if (!unit) {
      throw new Error('Unit of measure not found');
    }
    return unit;
  }

  /**
   * Update: SuperAdmin can edit system records and any org record. OrgAdmin can edit only their org's records.
   */
  async update(
    userRole: UserRole,
    userTenantId: string,
    id: string,
    data: UpdateUnitOfMeasureDTO,
  ): Promise<UnitOfMeasure> {
    const unit = await this.unitOfMeasureRepository.findByIdAny(id);
    if (!unit) {
      throw new Error('Unit of measure not found');
    }
    this.assertCanEdit(userRole, userTenantId, unit);

    if (data.code !== undefined || data.name !== undefined) {
      unit.update(
        data.code ?? unit.getCode(),
        data.name ?? unit.getName(),
      );
    }
    if (data.isActive !== undefined) {
      if (data.isActive) unit.activate();
      else unit.deactivate();
    }
    return this.unitOfMeasureRepository.save(unit);
  }

  /**
   * Delete: same permission as update.
   */
  async delete(userRole: UserRole, userTenantId: string, id: string): Promise<void> {
    const unit = await this.unitOfMeasureRepository.findByIdAny(id);
    if (!unit) {
      throw new Error('Unit of measure not found');
    }
    this.assertCanEdit(userRole, userTenantId, unit);
    await this.unitOfMeasureRepository.delete(id, unit.getTenantId());
  }

  async getAll(tenantId: string): Promise<UnitOfMeasure[]> {
    return this.unitOfMeasureRepository.findAll(tenantId);
  }

  private assertCanEdit(
    userRole: UserRole,
    userTenantId: string,
    unit: UnitOfMeasure,
  ): void {
    const recordTenantId = unit.getTenantId();
    if (recordTenantId === null) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Only Super Admin can edit system-wide units of measure');
      }
      return;
    }
    if (userRole === UserRole.SUPER_ADMIN) {
      return;
    }
    if (userRole === UserRole.ORG_ADMIN && recordTenantId === userTenantId) {
      return;
    }
    throw new Error('You do not have permission to edit this unit of measure');
  }
}
