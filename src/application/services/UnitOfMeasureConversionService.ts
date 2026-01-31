import { UserRole } from '../../domain/enums/UserRole.js';
import { UnitOfMeasureConversion } from '../../domain/entities/UnitOfMeasureConversion.js';
import type { IUnitOfMeasureConversionRepository } from '../../domain/repositories/IUnitOfMeasureConversionRepository.js';
import type { IUnitOfMeasureRepository } from '../../domain/repositories/IUnitOfMeasureRepository.js';
import type {
  CreateUnitOfMeasureConversionDTO,
  UpdateUnitOfMeasureConversionDTO,
} from '../dtos/UnitOfMeasureConversionDTOs.js';

export class UnitOfMeasureConversionService {
  constructor(
    private readonly conversionRepository: IUnitOfMeasureConversionRepository,
    private readonly unitOfMeasureRepository: IUnitOfMeasureRepository,
  ) {}

  /**
   * Create: SuperAdmin can create system (isSystem=true) or for any org. OrgAdmin only for own org.
   * fromUnitId and toUnitId must exist and be visible to tenant (system + tenant's units).
   */
  async create(
    userRole: UserRole,
    userTenantId: string,
    data: CreateUnitOfMeasureConversionDTO,
  ): Promise<UnitOfMeasureConversion> {
    let effectiveTenantId: string | null;
    let isSystem = false;

    if (data.isSystem === true) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Only Super Admin can create system-wide unit conversions');
      }
      effectiveTenantId = null;
      isSystem = true;
    } else {
      effectiveTenantId = data.tenantId ?? userTenantId;
      if (userRole === UserRole.ORG_ADMIN && effectiveTenantId !== userTenantId) {
        throw new Error('Org Admin can only create conversions for their own organization');
      }
    }

    await this.assertUnitsVisible(userTenantId, data.fromUnitId, data.toUnitId);

    const existing = await this.conversionRepository.findByFromAndToInScope(
      data.fromUnitId,
      data.toUnitId,
      effectiveTenantId,
    );
    if (existing) {
      throw new Error(
        'A conversion between these two units already exists for this scope',
      );
    }

    const conversion = UnitOfMeasureConversion.create(
      effectiveTenantId,
      data.fromUnitId,
      data.toUnitId,
      data.factor,
      isSystem,
    );
    return this.conversionRepository.save(conversion);
  }

  async get(tenantId: string, id: string): Promise<UnitOfMeasureConversion> {
    const conversion = await this.conversionRepository.findById(id, tenantId);
    if (!conversion) {
      throw new Error('Unit conversion not found');
    }
    return conversion;
  }

  /**
   * Update: SuperAdmin can edit system and any org. OrgAdmin only own org.
   */
  async update(
    userRole: UserRole,
    userTenantId: string,
    id: string,
    data: UpdateUnitOfMeasureConversionDTO,
  ): Promise<UnitOfMeasureConversion> {
    const conversion = await this.conversionRepository.findByIdAny(id);
    if (!conversion) {
      throw new Error('Unit conversion not found');
    }
    this.assertCanEdit(userRole, userTenantId, conversion);

    if (data.factor !== undefined) {
      conversion.updateFactor(data.factor);
    }
    return this.conversionRepository.save(conversion);
  }

  async delete(userRole: UserRole, userTenantId: string, id: string): Promise<void> {
    const conversion = await this.conversionRepository.findByIdAny(id);
    if (!conversion) {
      throw new Error('Unit conversion not found');
    }
    this.assertCanEdit(userRole, userTenantId, conversion);
    await this.conversionRepository.delete(id, conversion.getTenantId());
  }

  async getAll(tenantId: string): Promise<UnitOfMeasureConversion[]> {
    return this.conversionRepository.findAll(tenantId);
  }

  private async assertUnitsVisible(
    tenantId: string,
    fromUnitId: string,
    toUnitId: string,
  ): Promise<void> {
    const fromUnit = await this.unitOfMeasureRepository.findById(fromUnitId, tenantId);
    const toUnit = await this.unitOfMeasureRepository.findById(toUnitId, tenantId);
    if (!fromUnit) {
      throw new Error('From unit not found or not visible in this context');
    }
    if (!toUnit) {
      throw new Error('To unit not found or not visible in this context');
    }
  }

  private assertCanEdit(
    userRole: UserRole,
    userTenantId: string,
    conversion: UnitOfMeasureConversion,
  ): void {
    const recordTenantId = conversion.getTenantId();
    if (recordTenantId === null) {
      if (userRole !== UserRole.SUPER_ADMIN) {
        throw new Error('Only Super Admin can edit system-wide unit conversions');
      }
      return;
    }
    if (userRole === UserRole.SUPER_ADMIN) {
      return;
    }
    if (userRole === UserRole.ORG_ADMIN && recordTenantId === userTenantId) {
      return;
    }
    throw new Error('You do not have permission to edit this unit conversion');
  }
}
