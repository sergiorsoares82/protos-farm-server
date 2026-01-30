import { Asset } from '../../domain/entities/Asset.js';
import type { IAssetRepository } from '../../domain/repositories/IAssetRepository.js';
import type { CreateAssetDTO, UpdateAssetDTO } from '../dtos/AssetDTOs.js';
export class AssetService {
  constructor(private readonly assetRepository: IAssetRepository) {}

  async createAsset(tenantId: string, data: CreateAssetDTO): Promise<Asset> {
    const asset = Asset.create(
      tenantId,
      data.name,
      data.assetKind,
      data.code,
    );
    return this.assetRepository.save(asset);
  }

  async getAsset(tenantId: string, id: string): Promise<Asset> {
    const asset = await this.assetRepository.findById(id, tenantId);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async updateAsset(tenantId: string, id: string, data: UpdateAssetDTO): Promise<Asset> {
    const asset = await this.getAsset(tenantId, id);

    if (data.name !== undefined || data.assetKind !== undefined || data.code !== undefined) {
      asset.update(
        data.name ?? asset.getName(),
        data.assetKind ?? asset.getAssetKind(),
        data.code !== undefined ? data.code : asset.getCode(),
      );
    }

    if (data.isActive !== undefined) {
      if (data.isActive) {
        asset.activate();
      } else {
        asset.deactivate();
      }
    }

    return this.assetRepository.save(asset);
  }

  async deleteAsset(tenantId: string, id: string): Promise<void> {
    await this.assetRepository.delete(id, tenantId);
  }

  async getAllAssets(tenantId: string): Promise<Asset[]> {
    return this.assetRepository.findAll(tenantId);
  }
}
