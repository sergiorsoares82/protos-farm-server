import { Repository } from 'typeorm';
import { RuralPropertyEntity } from '../database/entities/RuralPropertyEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type {
  CreateRuralPropertyRequestDTO,
  RuralPropertyResponseDTO,
  UpdateRuralPropertyRequestDTO,
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

  async update(
    id: string,
    tenantId: string,
    data: UpdateRuralPropertyRequestDTO,
  ): Promise<RuralPropertyResponseDTO> {
    const existing = await this.repo.findOne({ where: { id, tenantId } });
    if (!existing) {
      throw new Error('Imóvel rural não encontrado');
    }
    if (data.nomeImovelIncra !== undefined) {
      existing.nomeImovelIncra = data.nomeImovelIncra.trim();
    }
    if (data.codigoSncr !== undefined) {
      existing.codigoSncr = data.codigoSncr ? data.codigoSncr.trim() : null;
    }
    if (data.nirf !== undefined) {
      existing.nirf = data.nirf ? data.nirf.trim() : null;
    }
    if (data.municipio !== undefined) {
      existing.municipio = data.municipio ? data.municipio.trim() : null;
    }
    if (data.uf !== undefined) {
      existing.uf = data.uf ? data.uf.trim() : null;
    }
    const saved = await this.repo.save(existing);
    return mapToDTO(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const result = await this.repo.delete({ id, tenantId });
    if (result.affected === 0) {
      throw new Error('Imóvel rural não encontrado');
    }
  }
}
