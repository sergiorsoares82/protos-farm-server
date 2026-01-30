import { Repository } from 'typeorm';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import { Asset } from '../../domain/entities/Asset.js';
import { AssetKind } from '../../domain/enums/AssetKind.js';
import { AssetEntity } from '../database/entities/AssetEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class AssetRepository implements IAssetRepository {
  private repo: Repository<AssetEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(AssetEntity);
  }

  async findAll(tenantId: string): Promise<Asset[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Asset | null> {
    const entity = await this.repo.findOne({ where: { id, tenantId } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(asset: Asset): Promise<Asset> {
    const entity = new AssetEntity();
    (entity as any).id = asset.getId();
    entity.tenantId = asset.getTenantId();
    entity.name = asset.getName();
    entity.code = asset.getCode() ?? null;
    entity.assetKind = asset.getAssetKind();
    entity.isActive = asset.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: AssetEntity): Asset {
    return new Asset({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      code: entity.code ?? undefined,
      assetKind: entity.assetKind as AssetKind,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
