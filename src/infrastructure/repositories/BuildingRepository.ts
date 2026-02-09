import { Repository } from 'typeorm';
import type { IBuildingRepository } from '../../domain/repositories/IBuildingRepository.js';
import { Building } from '../../domain/entities/Building.js';
import { BuildingEntity } from '../database/entities/BuildingEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class BuildingRepository implements IBuildingRepository {
  private repo: Repository<BuildingEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(BuildingEntity);
  }

  async findAll(tenantId: string): Promise<Building[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
      relations: ['costCenter'],
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Building | null> {
    const entity = await this.repo.findOne({ 
      where: { id, tenantId },
      relations: ['costCenter'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByCostCenterId(costCenterId: string, tenantId: string): Promise<Building | null> {
    const entity = await this.repo.findOne({ 
      where: { costCenterId, tenantId },
      relations: ['costCenter'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(building: Building): Promise<Building> {
    const entity = new BuildingEntity();
    (entity as any).id = building.getId();
    entity.tenantId = building.getTenantId();
    entity.costCenterId = building.getCostCenterId();
    entity.areaM2 = building.getAreaM2() ?? null;
    entity.landRegistry = building.getLandRegistry() ?? null;
    entity.locationDetails = building.getLocationDetails() ?? null;
    entity.constructionDate = building.getConstructionDate() ?? null;
    entity.isActive = building.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: BuildingEntity): Building {
    return new Building({
      id: entity.id,
      tenantId: entity.tenantId,
      costCenterId: entity.costCenterId,
      areaM2: entity.areaM2 ?? undefined,
      landRegistry: entity.landRegistry ?? undefined,
      locationDetails: entity.locationDetails ?? undefined,
      constructionDate: entity.constructionDate ?? undefined,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
