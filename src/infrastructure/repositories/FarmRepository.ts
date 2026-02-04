import { Repository, In } from 'typeorm';
import { FarmEntity } from '../database/entities/FarmEntity.js';
import { FarmRuralPropertyEntity } from '../database/entities/FarmRuralPropertyEntity.js';
import { RuralPropertyEntity } from '../database/entities/RuralPropertyEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type { CreateFarmRequestDTO, UpdateFarmRequestDTO } from '../../application/dtos/FarmDTOs.js';

export class FarmRepository {
  private farmRepo: Repository<FarmEntity>;
  private farmRuralPropertyRepo: Repository<FarmRuralPropertyEntity>;
  private ruralPropertyRepo: Repository<RuralPropertyEntity>;

  constructor() {
    this.farmRepo = AppDataSource.getRepository(FarmEntity);
    this.farmRuralPropertyRepo = AppDataSource.getRepository(FarmRuralPropertyEntity);
    this.ruralPropertyRepo = AppDataSource.getRepository(RuralPropertyEntity);
  }

  async findAll(tenantId: string): Promise<FarmEntity[]> {
    return this.farmRepo.find({
      where: { tenantId },
      relations: ['farmRuralProperties', 'farmRuralProperties.ruralProperty'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<FarmEntity | null> {
    return this.farmRepo.findOne({
      where: { id, tenantId },
      relations: ['farmRuralProperties', 'farmRuralProperties.ruralProperty'],
    });
  }

  async create(
    tenantId: string,
    data: CreateFarmRequestDTO
  ): Promise<FarmEntity> {
    const farm = this.farmRepo.create({
      tenantId,
      name: data.name.trim(),
      location: data.location?.trim() || null,
      totalArea: data.totalArea ?? null,
    });
    const saved = await this.farmRepo.save(farm);
    const ruralPropertyIds = data.ruralPropertyIds ?? [];
    if (ruralPropertyIds.length) {
      const existing = await this.ruralPropertyRepo.find({
        where: { id: In(ruralPropertyIds), tenantId },
      });
      const foundIds = new Set(existing.map((rp) => rp.id));
      const missing = ruralPropertyIds.filter((id) => !foundIds.has(id));
      if (missing.length) {
        throw new Error(`Imóveis rurais não encontrados ou de outro tenant: ${missing.join(', ')}`);
      }
      for (const ruralPropertyId of ruralPropertyIds) {
        const frp = this.farmRuralPropertyRepo.create({
          tenantId,
          farmId: saved.id,
          ruralPropertyId,
        });
        await this.farmRuralPropertyRepo.save(frp);
      }
    }
    const full = await this.findById(saved.id, tenantId);
    if (!full) throw new Error('Failed to load farm after create');
    return full;
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateFarmRequestDTO
  ): Promise<FarmEntity> {
    const farm = await this.farmRepo.findOne({ where: { id, tenantId } });
    if (!farm) throw new Error('Farm not found');

    if (data.name !== undefined) farm.name = data.name.trim();
    if (data.location !== undefined) farm.location = data.location?.trim() || null;
    if (data.totalArea !== undefined) farm.totalArea = data.totalArea ?? null;
    await this.farmRepo.save(farm);

    if (data.ruralPropertyIds !== undefined) {
      await this.farmRuralPropertyRepo.delete({ farmId: id });
      const ruralPropertyIds = data.ruralPropertyIds;
      if (ruralPropertyIds.length) {
        const existing = await this.ruralPropertyRepo.find({
          where: { id: In(ruralPropertyIds), tenantId },
        });
        const foundIds = new Set(existing.map((rp) => rp.id));
        const missing = ruralPropertyIds.filter((rid) => !foundIds.has(rid));
        if (missing.length) {
          throw new Error(`Imóveis rurais não encontrados ou de outro tenant: ${missing.join(', ')}`);
        }
        for (const ruralPropertyId of ruralPropertyIds) {
          const frp = this.farmRuralPropertyRepo.create({
            tenantId,
            farmId: id,
            ruralPropertyId,
          });
          await this.farmRuralPropertyRepo.save(frp);
        }
      }
    }

    const full = await this.findById(id, tenantId);
    if (!full) throw new Error('Failed to load farm after update');
    return full;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const result = await this.farmRepo.delete({ id, tenantId });
    if (result.affected === 0) throw new Error('Farm not found');
  }
}
