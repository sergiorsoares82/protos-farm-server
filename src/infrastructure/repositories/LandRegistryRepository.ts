import { Repository } from 'typeorm';
import { LandRegistryEntity } from '../database/entities/LandRegistryEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type {
  CreateLandRegistryRequestDTO,
  LandRegistryResponseDTO,
} from '../../application/dtos/LandRegistryDTOs.js';

function mapToDTO(entity: LandRegistryEntity): LandRegistryResponseDTO {
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    ruralPropertyId: entity.ruralPropertyId ?? null,
    numeroMatricula: entity.numeroMatricula,
    cartorio: entity.cartorio,
    dataRegistro: entity.dataRegistro ?? null,
    registro: entity.registro ?? null,
    livroOuFicha: entity.livroOuFicha ?? null,
    areaHa: entity.areaHa != null ? Number(entity.areaHa) : null,
    municipio: entity.municipio ?? null,
    uf: entity.uf ?? null,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export class LandRegistryRepository {
  private repo: Repository<LandRegistryEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(LandRegistryEntity);
  }

  async findAll(tenantId: string): Promise<LandRegistryResponseDTO[]> {
    const list = await this.repo.find({
      where: { tenantId },
      order: { numeroMatricula: 'ASC' },
    });
    return list.map(mapToDTO);
  }

  async create(
    tenantId: string,
    data: CreateLandRegistryRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    const entity = this.repo.create({
      tenantId,
      ruralPropertyId: data.ruralPropertyId?.trim() || null,
      numeroMatricula: data.numeroMatricula.trim(),
      cartorio: data.cartorio.trim(),
      dataRegistro: data.dataRegistro?.trim() || null,
      registro: data.registro?.trim() || null,
      livroOuFicha: data.livroOuFicha?.trim() || null,
      areaHa: data.areaHa ?? null,
      municipio: data.municipio?.trim() || null,
      uf: data.uf?.trim() || null,
    });
    const saved = await this.repo.save(entity);
    return mapToDTO(saved);
  }
}
