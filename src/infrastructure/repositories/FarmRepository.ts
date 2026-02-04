import { Repository } from 'typeorm';
import { FarmEntity } from '../database/entities/FarmEntity.js';
import { FarmOwnerEntity } from '../database/entities/FarmOwnerEntity.js';
import { PersonEntity } from '../database/entities/PersonEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type { CreateFarmRequestDTO, UpdateFarmRequestDTO } from '../../application/dtos/FarmDTOs.js';

export class FarmRepository {
  private farmRepo: Repository<FarmEntity>;
  private farmOwnerRepo: Repository<FarmOwnerEntity>;
  private personRepo: Repository<PersonEntity>;

  constructor() {
    this.farmRepo = AppDataSource.getRepository(FarmEntity);
    this.farmOwnerRepo = AppDataSource.getRepository(FarmOwnerEntity);
    this.personRepo = AppDataSource.getRepository(PersonEntity);
  }

  async findAll(tenantId: string): Promise<FarmEntity[]> {
    return this.farmRepo.find({
      where: { tenantId },
      relations: ['farmOwners', 'farmOwners.person'],
      order: { name: 'ASC' },
    });
  }

  async findById(id: string, tenantId: string): Promise<FarmEntity | null> {
    return this.farmRepo.findOne({
      where: { id, tenantId },
      relations: ['farmOwners', 'farmOwners.person'],
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
    if (data.ownerIds?.length) {
      for (const personId of data.ownerIds) {
        const fo = this.farmOwnerRepo.create({
          tenantId,
          personId,
          farmId: saved.id,
          ownershipType: data.ownershipTypeByPersonId?.[personId] ?? null,
        });
        await this.farmOwnerRepo.save(fo);
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

    if (data.ownerIds !== undefined) {
      await this.farmOwnerRepo.delete({ farmId: id });
      for (const personId of data.ownerIds) {
        const fo = this.farmOwnerRepo.create({
          tenantId,
          personId,
          farmId: id,
          ownershipType: data.ownershipTypeByPersonId?.[personId] ?? null,
        });
        await this.farmOwnerRepo.save(fo);
      }
    } else if (data.ownershipTypeByPersonId) {
      const existing = await this.farmOwnerRepo.find({ where: { farmId: id }, relations: ['person'] });
      for (const fo of existing) {
        const ownership = data.ownershipTypeByPersonId[fo.personId];
        if (ownership !== undefined) {
          fo.ownershipType = ownership || null;
          await this.farmOwnerRepo.save(fo);
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
