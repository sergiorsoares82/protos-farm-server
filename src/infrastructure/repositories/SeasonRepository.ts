import { Repository } from 'typeorm';
import type { ISeasonRepository } from '../../domain/repositories/ISeasonRepository.js';
import { Season } from '../../domain/entities/Season.js';
import { SeasonEntity } from '../database/entities/SeasonEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class SeasonRepository implements ISeasonRepository {
  private repo: Repository<SeasonEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(SeasonEntity);
  }

  async findAll(tenantId: string): Promise<Season[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { startDate: 'DESC' },
    });
    return entities.map(this.toDomain);
  }

  async findById(id: string, tenantId: string): Promise<Season | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByName(name: string, tenantId: string): Promise<Season | null> {
    const entity = await this.repo.findOne({
      where: { name, tenantId },
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(season: Season): Promise<Season> {
    const entity = new SeasonEntity();
    entity.id = season.getId();
    entity.tenantId = season.getTenantId();
    entity.name = season.getName();
    entity.startDate = season.getStartDate().toISOString().slice(0, 10);
    entity.endDate = season.getEndDate().toISOString().slice(0, 10);
    entity.isActive = season.getIsActive();

    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: SeasonEntity): Season {
    return new Season({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      startDate: new Date(entity.startDate),
      endDate: new Date(entity.endDate),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}

