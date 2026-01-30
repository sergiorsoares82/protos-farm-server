import { IsNull, Repository } from 'typeorm';
import type { IWorkLocationRepository } from '../../domain/repositories/IWorkLocationRepository.js';
import { WorkLocation } from '../../domain/entities/WorkLocation.js';
import { FieldEntity } from '../database/entities/FieldEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class WorkLocationRepository implements IWorkLocationRepository {
  private repo: Repository<FieldEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(FieldEntity);
  }

  async findAll(tenantId: string): Promise<WorkLocation[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      relations: ['workLocationType'],
      order: { code: 'ASC' },
    });
    return entities
      .filter((e): e is FieldEntity & { workLocationType: NonNullable<FieldEntity['workLocationType']> } =>
        e.workLocationType != null,
      )
      .map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<WorkLocation | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
      relations: ['workLocationType'],
    });
    if (!entity || !entity.workLocationType) return null;
    return this.toDomain(entity as FieldEntity & { workLocationType: NonNullable<FieldEntity['workLocationType']> });
  }

  async findByCode(code: string, tenantId: string): Promise<WorkLocation | null> {
    const entity = await this.repo.findOne({
      where: { code, tenantId },
      relations: ['workLocationType'],
    });
    if (!entity || !entity.workLocationType) return null;
    return this.toDomain(entity as FieldEntity & { workLocationType: NonNullable<FieldEntity['workLocationType']> });
  }

  async save(workLocation: WorkLocation): Promise<WorkLocation> {
    const entity = new FieldEntity();
    entity.id = workLocation.getId();
    entity.tenantId = workLocation.getTenantId();
    entity.workLocationTypeId = workLocation.getTypeId();
    entity.code = workLocation.getCode();
    entity.name = workLocation.getName();
    entity.areaHectares =
      workLocation.getAreaHectares() != null
        ? workLocation.getAreaHectares()!.toString()
        : null;
    entity.costCenterId = workLocation.getCostCenterId();
    entity.isActive = workLocation.getIsActive();

    const saved = await this.repo.save(entity);
    const withRelation = await this.repo.findOne({
      where: { id: saved.id, tenantId: saved.tenantId },
      relations: ['workLocationType'],
    });
    if (!withRelation?.workLocationType) {
      throw new Error('Work location type not found after save');
    }
    return this.toDomain(withRelation as FieldEntity & { workLocationType: NonNullable<FieldEntity['workLocationType']> });
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  /** Backfill work_location_type_id from legacy type column using typeIdByCode map. */
  async backfillTypeIds(
    tenantId: string,
    typeIdByCode: Map<string, string>,
  ): Promise<void> {
    const entities = await this.repo.find({
      where: { tenantId, workLocationTypeId: IsNull() },
    });
    const toUpdate = entities.filter((e) => e.type != null && typeIdByCode.has(e.type));
    for (const e of toUpdate) {
      if (e.type) {
        e.workLocationTypeId = typeIdByCode.get(e.type)!;
        await this.repo.save(e);
      }
    }
  }

  private toDomain(
    entity: FieldEntity & { workLocationType: NonNullable<FieldEntity['workLocationType']> },
  ): WorkLocation {
    const t = entity.workLocationType;
    return new WorkLocation({
      id: entity.id,
      tenantId: entity.tenantId,
      code: entity.code,
      name: entity.name,
      typeId: t.id,
      typeCode: t.code,
      isTalhao: t.isTalhao,
      areaHectares: entity.areaHectares != null ? Number(entity.areaHectares) : null,
      costCenterId: entity.costCenterId,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
