import { Repository } from 'typeorm';
import type {
  FieldSeasonLink,
  IFieldSeasonRepository,
} from '../../domain/repositories/IFieldSeasonRepository.js';
import { FieldSeasonEntity } from '../database/entities/FieldSeasonEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class FieldSeasonRepository implements IFieldSeasonRepository {
  private repo: Repository<FieldSeasonEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(FieldSeasonEntity);
  }

  async getLinksForSeason(seasonId: string, tenantId: string): Promise<FieldSeasonLink[]> {
    const links = await this.repo.find({
      where: { seasonId, tenantId },
    });
    return links.map((l) => ({
      fieldId: l.fieldId,
      seasonId: l.seasonId,
      areaHectares: Number(l.areaHectares),
      costCenterId: l.costCenterId,
    }));
  }

  async getLatestSeasonForField(fieldId: string, tenantId: string): Promise<FieldSeasonLink | null> {
    const link = await this.repo.findOne({
      where: { fieldId, tenantId },
      relations: ['season'],
      order: { season: { startDate: 'DESC' } },
    });
    
    if (!link) return null;
    
    return {
      fieldId: link.fieldId,
      seasonId: link.seasonId,
      areaHectares: Number(link.areaHectares),
      costCenterId: link.costCenterId,
    };
  }

  async upsertLink(
    tenantId: string,
    seasonId: string,
    fieldId: string,
    costCenterId: string,
    areaHectares: number,
  ): Promise<void> {
    let link = await this.repo.findOne({
      where: { tenantId, seasonId, fieldId },
    });
    if (!link) {
      link = new FieldSeasonEntity();
      link.tenantId = tenantId;
      link.seasonId = seasonId;
      link.fieldId = fieldId;
    }
    link.costCenterId = costCenterId;
    link.areaHectares = areaHectares.toString();
    await this.repo.save(link);
  }

  async deleteLink(tenantId: string, seasonId: string, fieldId: string): Promise<void> {
    await this.repo.delete({ tenantId, seasonId, fieldId });
  }
}


