import { Season } from '../../domain/entities/Season.js';
import type { ISeasonRepository } from '../../domain/repositories/ISeasonRepository.js';
import type { IFieldRepository } from '../../domain/repositories/IFieldRepository.js';
import type { IFieldSeasonRepository, FieldSeasonLink } from '../../domain/repositories/IFieldSeasonRepository.js';
import type { CreateSeasonDTO, UpdateSeasonDTO } from '../dtos/SeasonDTOs.js';

export class SeasonService {
  constructor(
    private readonly seasonRepository: ISeasonRepository,
    private readonly fieldRepository?: IFieldRepository,
    private readonly fieldSeasonRepository?: IFieldSeasonRepository,
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
    areaHectares: number,
  ): Promise<void> {
    if (!this.fieldSeasonRepository || !this.fieldRepository) return;
    // Validate season and field belong to tenant
    await this.getSeason(tenantId, seasonId);
    const field = await this.fieldRepository.findById(fieldId, tenantId);
    if (!field) {
      throw new Error('Field not found');
    }
    // Default area if not provided or <= 0
    const area = areaHectares > 0 ? areaHectares : field.getAreaHectares();
    await this.fieldSeasonRepository.upsertLink(tenantId, seasonId, fieldId, area);
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

