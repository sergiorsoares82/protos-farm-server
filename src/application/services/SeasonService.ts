import { Season } from '../../domain/entities/Season.js';
import type { ISeasonRepository } from '../../domain/repositories/ISeasonRepository.js';
import type { IWorkLocationRepository } from '../../domain/repositories/IWorkLocationRepository.js';
import type {
  IFieldSeasonRepository,
  FieldSeasonLink,
} from '../../domain/repositories/IFieldSeasonRepository.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';
import type { ICostCenterCategoryRepository } from '../../domain/repositories/ICostCenterCategoryRepository.js';
import type { CreateSeasonDTO, UpdateSeasonDTO } from '../dtos/SeasonDTOs.js';

export class SeasonService {
  constructor(
    private readonly seasonRepository: ISeasonRepository,
    private readonly workLocationRepository?: IWorkLocationRepository,
    private readonly fieldSeasonRepository?: IFieldSeasonRepository,
    private readonly costCenterRepository?: ICostCenterRepository,
    private readonly categoryRepository?: ICostCenterCategoryRepository,
  ) {}

  async createSeason(tenantId: string, data: CreateSeasonDTO): Promise<Season> {
    const existing = await this.seasonRepository.findByName(data.name, tenantId);
    if (existing) {
      throw new Error(`Season with name '${data.name}' already exists`);
    }

    const start = new Date(data.startDate);
    const end = new Date(data.endDate);

    const season = Season.create(tenantId, data.name, start, end);
    return this.seasonRepository.save(season);
  }

  async getSeason(tenantId: string, id: string): Promise<Season> {
    const season = await this.seasonRepository.findById(id, tenantId);
    if (!season) {
      throw new Error('Season not found');
    }
    return season;
  }

  async updateSeason(tenantId: string, id: string, data: UpdateSeasonDTO): Promise<Season> {
    const season = await this.getSeason(tenantId, id);

    if (data.name && data.name !== season.getName()) {
      const existing = await this.seasonRepository.findByName(data.name, tenantId);
      if (existing) {
        throw new Error(`Season with name '${data.name}' already exists`);
      }
    }

    if (data.name || data.startDate || data.endDate) {
      const start = data.startDate ? new Date(data.startDate) : season.getStartDate();
      const end = data.endDate ? new Date(data.endDate) : season.getEndDate();
      season.update(data.name || season.getName(), start, end);
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        season.activate();
      } else {
        season.deactivate();
      }
    }

    return this.seasonRepository.save(season);
  }

  async deleteSeason(tenantId: string, id: string): Promise<void> {
    await this.seasonRepository.delete(id, tenantId);
  }

  async getAllSeasons(tenantId: string): Promise<Season[]> {
    return this.seasonRepository.findAll(tenantId);
  }

  async getFieldLinksForSeason(tenantId: string, seasonId: string): Promise<FieldSeasonLink[]> {
    if (!this.fieldSeasonRepository) {
      return [];
    }
    // Ensure season exists and belongs to tenant
    await this.getSeason(tenantId, seasonId);
    return this.fieldSeasonRepository.getLinksForSeason(seasonId, tenantId);
  }

  async upsertFieldLinkForSeason(
    tenantId: string,
    seasonId: string,
    fieldId: string,
    costCenterId: string,
    areaHectares: number,
  ): Promise<void> {
    if (
      !this.fieldSeasonRepository ||
      !this.workLocationRepository ||
      !this.costCenterRepository ||
      !this.categoryRepository
    ) {
      return;
    }
    // Validate season and work location belong to tenant; only TALHAO can be linked by season
    await this.getSeason(tenantId, seasonId);
    const workLocation = await this.workLocationRepository.findById(fieldId, tenantId);
    if (!workLocation) {
      throw new Error('Work location not found');
    }
    if (!workLocation.getIsTalhao()) {
      throw new Error('Only Talhão (field) work locations can be linked to a season');
    }
    const costCenter = await this.costCenterRepository.findById(costCenterId, tenantId);
    if (!costCenter) {
      throw new Error('Cost center not found');
    }
    const categoryId = costCenter.getCategoryId();
    if (!categoryId) {
      throw new Error('Cost center must be assigned to an Agricultura category');
    }
    const category = await this.categoryRepository.findById(categoryId, tenantId);
    if (!category) {
      throw new Error('Cost center category not found');
    }
    if (category.getCode() !== 'AGR') {
      throw new Error('Cost center must belong to Agricultura category');
    }
    const defaultArea = workLocation.getAreaHectares();
    const area =
      areaHectares > 0 ? areaHectares : (defaultArea != null ? defaultArea : 0);
    await this.fieldSeasonRepository.upsertLink(tenantId, seasonId, fieldId, costCenterId, area);
  }

  async deleteFieldLinkForSeason(
    tenantId: string,
    seasonId: string,
    fieldId: string,
  ): Promise<void> {
    if (!this.fieldSeasonRepository) return;
    await this.getSeason(tenantId, seasonId);
    await this.fieldSeasonRepository.deleteLink(tenantId, seasonId, fieldId);
  }
}

