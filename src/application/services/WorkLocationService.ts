import { WorkLocation } from '../../domain/entities/WorkLocation.js';
import type { IWorkLocationRepository } from '../../domain/repositories/IWorkLocationRepository.js';
import type { IWorkLocationTypeRepository } from '../../domain/repositories/IWorkLocationTypeRepository.js';
import type {
  CreateWorkLocationDTO,
  UpdateWorkLocationDTO,
} from '../dtos/WorkLocationDTOs.js';
import type { WorkLocationTypeService } from './WorkLocationTypeService.js';

export class WorkLocationService {
  constructor(
    private readonly workLocationRepository: IWorkLocationRepository,
    private readonly workLocationTypeRepository: IWorkLocationTypeRepository,
    private readonly workLocationTypeService: WorkLocationTypeService,
  ) {}

  private async ensureDefaultsAndBackfill(tenantId: string): Promise<void> {
    await this.workLocationTypeService.ensureDefaultTypes(tenantId);
    const types = await this.workLocationTypeRepository.findAll(tenantId);
    const typeIdByCode = new Map(types.map((t) => [t.getCode(), t.getId()]));
    await this.workLocationRepository.backfillTypeIds?.(tenantId, typeIdByCode);
  }

  async createWorkLocation(
    tenantId: string,
    data: CreateWorkLocationDTO,
  ): Promise<WorkLocation> {
    const existing = await this.workLocationRepository.findByCode(data.code, tenantId);
    if (existing) {
      throw new Error(`Work location with code '${data.code}' already exists`);
    }

    const type = await this.workLocationTypeRepository.findById(data.typeId, tenantId);
    if (!type) {
      throw new Error('Work location type not found');
    }
    if (!type.getIsActive()) {
      throw new Error('Work location type is not active');
    }

    const isTalhao = type.getIsTalhao();
    const areaHectares = data.areaHectares ?? null;
    const costCenterId = isTalhao ? null : (data.costCenterId ?? null);

    const workLocation = WorkLocation.create(
      tenantId,
      data.code,
      data.name,
      type.getId(),
      type.getCode(),
      isTalhao,
      areaHectares,
      costCenterId,
    );

    return this.workLocationRepository.save(workLocation);
  }

  async getWorkLocation(tenantId: string, id: string): Promise<WorkLocation> {
    await this.ensureDefaultsAndBackfill(tenantId);
    const workLocation = await this.workLocationRepository.findById(id, tenantId);
    if (!workLocation) {
      throw new Error('Work location not found');
    }
    return workLocation;
  }

  async updateWorkLocation(
    tenantId: string,
    id: string,
    data: UpdateWorkLocationDTO,
  ): Promise<WorkLocation> {
    await this.ensureDefaultsAndBackfill(tenantId);
    const workLocation = await this.workLocationRepository.findById(id, tenantId);
    if (!workLocation) {
      throw new Error('Work location not found');
    }

    if (data.code && data.code !== workLocation.getCode()) {
      const existing = await this.workLocationRepository.findByCode(data.code, tenantId);
      if (existing) {
        throw new Error(`Work location with code '${data.code}' already exists`);
      }
    }

    let typeId = workLocation.getTypeId();
    let typeCode = workLocation.getTypeCode();
    let isTalhao = workLocation.getIsTalhao();
    if (data.typeId) {
      const type = await this.workLocationTypeRepository.findById(data.typeId, tenantId);
      if (!type) {
        throw new Error('Work location type not found');
      }
      if (!type.getIsActive()) {
        throw new Error('Work location type is not active');
      }
      typeId = type.getId();
      typeCode = type.getCode();
      isTalhao = type.getIsTalhao();
    }

    const areaHectares =
      data.areaHectares !== undefined ? data.areaHectares : workLocation.getAreaHectares();
    const costCenterId =
      data.costCenterId !== undefined ? data.costCenterId : workLocation.getCostCenterId();

    if (data.code || data.name || data.areaHectares !== undefined || data.costCenterId !== undefined || data.typeId) {
      workLocation.update(
        data.code ?? workLocation.getCode(),
        data.name ?? workLocation.getName(),
        areaHectares,
        costCenterId,
        data.typeId ? typeId : undefined,
        data.typeId ? typeCode : undefined,
        data.typeId ? isTalhao : undefined,
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        workLocation.activate();
      } else {
        workLocation.deactivate();
      }
    }

    return this.workLocationRepository.save(workLocation);
  }

  async deleteWorkLocation(tenantId: string, id: string): Promise<void> {
    await this.workLocationRepository.delete(id, tenantId);
  }

  async getAllWorkLocations(tenantId: string): Promise<WorkLocation[]> {
    await this.ensureDefaultsAndBackfill(tenantId);
    return this.workLocationRepository.findAll(tenantId);
  }
}
