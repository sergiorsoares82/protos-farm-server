import { Repository } from 'typeorm';
import { LandRegistryEntity } from '../database/entities/LandRegistryEntity.js';
import { PropertyOwnershipEntity } from '../database/entities/PropertyOwnershipEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type {
  CreateLandRegistryRequestDTO,
  LandRegistryResponseDTO,
  UpsertLandRegistryOwnersRequestDTO,
  UpdateLandRegistryRequestDTO,
} from '../../application/dtos/LandRegistryDTOs.js';

function mapToDTO(entity: LandRegistryEntity): LandRegistryResponseDTO {
  const owners = (entity.propertyOwnerships || []).map((po: PropertyOwnershipEntity) => ({
    id: po.id,
    personId: po.personId,
    personName: (po as any).person?.nome ?? '',
    percentualPosse: po.percentualPosse != null ? Number(po.percentualPosse) : null,
    dataAquisicao: po.dataAquisicao ?? null,
    dataBaixa: po.dataBaixa ?? null,
    tipoAquisicao: po.tipoAquisicao ?? null,
  }));
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
    owners,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

export class LandRegistryRepository {
  private repo: Repository<LandRegistryEntity>;
  private propertyOwnershipRepo: Repository<PropertyOwnershipEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(LandRegistryEntity);
    this.propertyOwnershipRepo = AppDataSource.getRepository(PropertyOwnershipEntity);
  }

  async findAll(tenantId: string): Promise<LandRegistryResponseDTO[]> {
    const list = await this.repo.find({
      where: { tenantId },
      relations: ['propertyOwnerships', 'propertyOwnerships.person'],
      order: { numeroMatricula: 'ASC' },
    });
    return list.map(mapToDTO);
  }

  async findById(id: string, tenantId: string): Promise<LandRegistryEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['propertyOwnerships', 'propertyOwnerships.person'],
    });
  }

  async upsertOwners(
    tenantId: string,
    landRegistryId: string,
    data: UpsertLandRegistryOwnersRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    const landRegistry = await this.repo.findOne({
      where: { id: landRegistryId, tenantId },
    });
    if (!landRegistry) throw new Error('Matrícula não encontrada');
    await this.propertyOwnershipRepo.delete({ landRegistryId });
    for (const o of data.owners) {
      const po = this.propertyOwnershipRepo.create({
        tenantId,
        landRegistryId,
        personId: o.personId,
        percentualPosse: o.percentualPosse ?? null,
        dataAquisicao: o.dataAquisicao?.trim() || null,
        tipoAquisicao: o.tipoAquisicao?.trim() || null,
      });
      await this.propertyOwnershipRepo.save(po);
    }
    const updated = await this.findById(landRegistryId, tenantId);
    if (!updated) throw new Error('Failed to load land registry after upsert owners');
    return mapToDTO(updated);
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

  async update(
    tenantId: string,
    id: string,
    data: UpdateLandRegistryRequestDTO,
  ): Promise<LandRegistryResponseDTO> {
    const existing = await this.repo.findOne({ where: { id, tenantId } });
    if (!existing) throw new Error('Matrícula não encontrada');

    if (data.ruralPropertyId !== undefined) {
      existing.ruralPropertyId = data.ruralPropertyId?.trim() || null;
    }
    if (data.numeroMatricula !== undefined) {
      existing.numeroMatricula = data.numeroMatricula.trim();
    }
    if (data.cartorio !== undefined) {
      existing.cartorio = data.cartorio.trim();
    }
    if (data.dataRegistro !== undefined) {
      existing.dataRegistro = data.dataRegistro?.trim() || null;
    }
    if (data.registro !== undefined) {
      existing.registro = data.registro?.trim() || null;
    }
    if (data.livroOuFicha !== undefined) {
      existing.livroOuFicha = data.livroOuFicha?.trim() || null;
    }
    if (data.areaHa !== undefined) {
      existing.areaHa = data.areaHa ?? null;
    }
    if (data.municipio !== undefined) {
      existing.municipio = data.municipio?.trim() || null;
    }
    if (data.uf !== undefined) {
      existing.uf = data.uf?.trim() || null;
    }

    const saved = await this.repo.save(existing);
    return mapToDTO(saved);
  }
}
