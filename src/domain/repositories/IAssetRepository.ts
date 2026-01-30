import type { Asset } from '../entities/Asset.js';

export interface IAssetRepository {
  findAll(tenantId: string): Promise<Asset[]>;
  findById(id: string, tenantId: string): Promise<Asset | null>;
  save(asset: Asset): Promise<Asset>;
  delete(id: string, tenantId: string): Promise<void>;
}
