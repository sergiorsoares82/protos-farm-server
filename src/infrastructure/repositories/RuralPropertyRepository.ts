import { Repository } from 'typeorm';
import { RuralPropertyEntity } from '../database/entities/RuralPropertyEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type {
  CreateRuralPropertyRequestDTO,
  RuralPropertyResponseDTO,
} from '../../application/dtos/RuralPropertyDTOs.js';

function mapToDTO(entity: RuralPropertyEntity): RuralPropertyResponseDTO {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    codigoSncr: entity.codigoSncr ?? null,
    nirf: entity.nirf ?? null,
    nomeImovelIncra: entity.nomeImovelIncra,
    municipio: entity.municipio ?? null,
    uf: entity.uf ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export class RuralPropertyRepository {
  private repo: Repository<RuralPropertyEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(RuralPropertyEntity);
  }

  async findAll(tenantId: string): Promise<RuralPropertyResponseDTO[]> {
    const list = await this.repo.find({
      where: { tenantId },
      order: { nomeImovelIncra: 'ASC' },
    });
    return list.map(mapToDTO);
  }

  async create(
    tenantId: string,
    data: CreateRuralPropertyRequestDTO,
  ): Promise<RuralPropertyResponseDTO> {
    const entity = this.repo.create({
      tenantId,
      nomeImovelIncra: data.nomeImovelIncra.trim(),
      codigoSncr: data.codigoSncr?.trim() || null,
      nirf: data.nirf?.trim() || null,
      municipio: data.municipio?.trim() || null,
      uf: data.uf?.trim() || null,
    });
    const saved = await this.repo.save(entity);
    return mapToDTO(saved);
  }
}
