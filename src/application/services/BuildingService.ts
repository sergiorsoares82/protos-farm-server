import { Building } from '../../domain/entities/Building.js';
import type { IBuildingRepository } from '../../domain/repositories/IBuildingRepository.js';
import type { CreateBuildingDTO, UpdateBuildingDTO } from '../dtos/BuildingDTOs.js';

export class BuildingService {
  constructor(
    private readonly buildingRepository: IBuildingRepository,
  ) {}

  async createBuilding(tenantId: string, data: CreateBuildingDTO): Promise<Building> {
    const building = Building.create(
      tenantId,
      data.costCenterId,
      data.areaM2,
      data.landRegistry,
      data.locationDetails,
      data.constructionDate,
    );
    return this.buildingRepository.save(building);
  }

  async getBuilding(tenantId: string, id: string): Promise<Building> {
    const building = await this.buildingRepository.findById(id, tenantId);
    if (!building) {
      throw new Error('Building not found');
    }
    return building;
  }

  async getBuildingByCostCenter(tenantId: string, costCenterId: string): Promise<Building | null> {
    return this.buildingRepository.findByCostCenterId(costCenterId, tenantId);
  }

  async updateBuilding(tenantId: string, id: string, data: UpdateBuildingDTO): Promise<Building> {
    const building = await this.getBuilding(tenantId, id);

    if (
      data.areaM2 !== undefined ||
      data.landRegistry !== undefined ||
      data.locationDetails !== undefined ||
      data.constructionDate !== undefined
    ) {
      building.update(
        data.areaM2,
        data.landRegistry,
        data.locationDetails,
        data.constructionDate,
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        building.activate();
      } else {
        building.deactivate();
      }
    }

    return this.buildingRepository.save(building);
  }

  async deleteBuilding(tenantId: string, id: string): Promise<void> {
    await this.buildingRepository.delete(id, tenantId);
  }

  async getAllBuildings(tenantId: string): Promise<Building[]> {
    return this.buildingRepository.findAll(tenantId);
  }
}
