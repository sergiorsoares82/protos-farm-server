import { Repository } from 'typeorm';
import { ProductionSiteEntity } from '../database/entities/ProductionSiteEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type { ProductionSiteResponseDTO } from '../../application/dtos/ProductionSiteDTOs.js';

function mapToDTO(entity: ProductionSiteEntity): ProductionSiteResponseDTO {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    farmId: entity.farmId,
    nomeBloco: entity.nomeBloco,
    descricao: entity.descricao ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export class ProductionSiteRepository {
  private repo: Repository<ProductionSiteEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(ProductionSiteEntity);
  }

  async findByFarmId(tenantId: string, farmId: string): Promise<ProductionSiteResponseDTO[]> {
    const list = await this.repo.find({
      where: { tenantId, farmId },
      order: { nomeBloco: 'ASC' },
    });
    return list.map(mapToDTO);
  }
}
