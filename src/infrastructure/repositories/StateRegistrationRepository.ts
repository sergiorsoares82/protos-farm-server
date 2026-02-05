import { Repository } from 'typeorm';
import { StateRegistrationEntity } from '../database/entities/StateRegistrationEntity.js';
import { StateRegistrationParticipantEntity } from '../database/entities/StateRegistrationParticipantEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import type {
  CreateStateRegistrationRequestDTO,
  StateRegistrationResponseDTO,
  UpdateStateRegistrationRequestDTO,
} from '../../application/dtos/StateRegistrationDTOs.js';

export function mapStateRegistrationToDTO(entity: StateRegistrationEntity): StateRegistrationResponseDTO {
  const participants = (entity.participants || []).map((p) => ({
    id: p.id,
    cpf: p.cpf,
    nome: p.nome,
    participation: p.participation ?? null,
  }));
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    personId: entity.personId ?? null,
    ruralPropertyId: entity.ruralPropertyId ?? null,
    numeroIe: entity.numeroIe,
    cpfCnpj: entity.cpfCnpj ?? null,
    nomeResponsavel: entity.nomeResponsavel ?? null,
    nomeEstabelecimento: entity.nomeEstabelecimento ?? null,
    cnaeCodigo: entity.cnaeCodigo ?? null,
    cnaeDescricao: entity.cnaeDescricao ?? null,
    regimeApuracao: entity.regimeApuracao ?? null,
    categoria: entity.categoria ?? null,
    dataInscricao: entity.dataInscricao ?? null,
    dataFimContrato: entity.dataFimContrato ?? null,
    situacao: entity.situacao,
    dataSituacaoInscricao: entity.dataSituacaoInscricao ?? null,
    cep: entity.cep ?? null,
    uf: entity.uf,
    municipio: entity.municipio ?? null,
    distritoPovoado: entity.distritoPovoado ?? null,
    bairro: entity.bairro ?? null,
    logradouro: entity.logradouro ?? null,
    numero: entity.numero ?? null,
    complemento: entity.complemento ?? null,
    referenciaLocalizacao: entity.referenciaLocalizacao ?? null,
    optanteProgramaLeite: entity.optanteProgramaLeite,
    participants,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}

function mapCreateToEntity(
  tenantId: string,
  data: CreateStateRegistrationRequestDTO,
): Partial<StateRegistrationEntity> {
  return {
    tenantId,
    personId: data.personId?.trim() || null,
    ruralPropertyId: data.ruralPropertyId?.trim() || null,
    numeroIe: data.numeroIe.trim(),
    uf: data.uf.trim().toUpperCase().slice(0, 2),
    situacao: data.situacao?.trim() || 'ATIVO',
    cpfCnpj: data.cpfCnpj?.trim() || null,
    nomeResponsavel: data.nomeResponsavel?.trim() || null,
    nomeEstabelecimento: data.nomeEstabelecimento?.trim() || null,
    cnaeCodigo: data.cnaeCodigo?.trim() || null,
    cnaeDescricao: data.cnaeDescricao?.trim() || null,
    regimeApuracao: data.regimeApuracao?.trim() || null,
    categoria: data.categoria?.trim() || null,
    dataInscricao: data.dataInscricao?.trim() || null,
    dataFimContrato: data.dataFimContrato?.trim() || null,
    dataSituacaoInscricao: data.dataSituacaoInscricao?.trim() || null,
    cep: data.cep?.trim() || null,
    municipio: data.municipio?.trim() || null,
    distritoPovoado: data.distritoPovoado?.trim() || null,
    bairro: data.bairro?.trim() || null,
    logradouro: data.logradouro?.trim() || null,
    numero: data.numero?.trim() || null,
    complemento: data.complemento?.trim() || null,
    referenciaLocalizacao: data.referenciaLocalizacao?.trim() || null,
    optanteProgramaLeite: data.optanteProgramaLeite ?? false,
  };
}

export class StateRegistrationRepository {
  private repo: Repository<StateRegistrationEntity>;
  private participantRepo: Repository<StateRegistrationParticipantEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(StateRegistrationEntity);
    this.participantRepo = AppDataSource.getRepository(StateRegistrationParticipantEntity);
  }

  async findAll(tenantId: string): Promise<StateRegistrationResponseDTO[]> {
    const list = await this.repo.find({
      where: { tenantId },
      relations: ['participants'],
      order: { numeroIe: 'ASC' },
    });
    return list.map(mapStateRegistrationToDTO);
  }

  async findById(id: string, tenantId: string): Promise<StateRegistrationEntity | null> {
    return this.repo.findOne({
      where: { id, tenantId },
      relations: ['participants'],
    });
  }

  async create(
    tenantId: string,
    data: CreateStateRegistrationRequestDTO,
  ): Promise<StateRegistrationResponseDTO> {
    if (data.ruralPropertyId?.trim()) {
      const existingForProperty = await this.repo.findOne({
        where: { tenantId, ruralPropertyId: data.ruralPropertyId.trim() },
      });
      if (existingForProperty) {
        throw new Error('Este imóvel rural já está vinculado a outro produtor rural');
      }
    }
    const entity = this.repo.create(mapCreateToEntity(tenantId, data));
    const saved = await this.repo.save(entity);
    await this.upsertParticipants(saved.id, data.participants ?? []);
    const loaded = await this.findById(saved.id, tenantId);
    if (!loaded) throw new Error('Failed to load state registration after create');
    return mapStateRegistrationToDTO(loaded);
  }

  async update(
    id: string,
    tenantId: string,
    data: UpdateStateRegistrationRequestDTO,
  ): Promise<StateRegistrationResponseDTO> {
    const existing = await this.repo.findOne({ where: { id, tenantId } });
    if (!existing) throw new Error('Inscrição estadual não encontrada');
    if (data.ruralPropertyId !== undefined) {
      const newId = data.ruralPropertyId?.trim() || null;
      if (newId) {
        const existingForProperty = await this.repo.findOne({
          where: { tenantId, ruralPropertyId: newId },
        });
        if (existingForProperty && existingForProperty.id !== id) {
          throw new Error('Este imóvel rural já está vinculado a outro produtor rural');
        }
      }
    }

    const updates: Partial<StateRegistrationEntity> = {
      ...(data.personId !== undefined && { personId: data.personId?.trim() || null }),
      ...(data.numeroIe != null && { numeroIe: data.numeroIe.trim() }),
      ...(data.uf != null && { uf: data.uf.trim().toUpperCase().slice(0, 2) }),
      ...(data.situacao != null && { situacao: data.situacao.trim() || 'ATIVO' }),
      ...(data.cpfCnpj !== undefined && { cpfCnpj: data.cpfCnpj?.trim() || null }),
      ...(data.nomeResponsavel !== undefined && { nomeResponsavel: data.nomeResponsavel?.trim() || null }),
      ...(data.nomeEstabelecimento !== undefined && { nomeEstabelecimento: data.nomeEstabelecimento?.trim() || null }),
      ...(data.cnaeCodigo !== undefined && { cnaeCodigo: data.cnaeCodigo?.trim() || null }),
      ...(data.cnaeDescricao !== undefined && { cnaeDescricao: data.cnaeDescricao?.trim() || null }),
      ...(data.regimeApuracao !== undefined && { regimeApuracao: data.regimeApuracao?.trim() || null }),
      ...(data.categoria !== undefined && { categoria: data.categoria?.trim() || null }),
      ...(data.dataInscricao !== undefined && { dataInscricao: data.dataInscricao?.trim() || null }),
      ...(data.dataFimContrato !== undefined && { dataFimContrato: data.dataFimContrato?.trim() || null }),
      ...(data.dataSituacaoInscricao !== undefined && { dataSituacaoInscricao: data.dataSituacaoInscricao?.trim() || null }),
      ...(data.cep !== undefined && { cep: data.cep?.trim() || null }),
      ...(data.municipio !== undefined && { municipio: data.municipio?.trim() || null }),
      ...(data.distritoPovoado !== undefined && { distritoPovoado: data.distritoPovoado?.trim() || null }),
      ...(data.bairro !== undefined && { bairro: data.bairro?.trim() || null }),
      ...(data.logradouro !== undefined && { logradouro: data.logradouro?.trim() || null }),
      ...(data.numero !== undefined && { numero: data.numero?.trim() || null }),
      ...(data.complemento !== undefined && { complemento: data.complemento?.trim() || null }),
      ...(data.referenciaLocalizacao !== undefined && { referenciaLocalizacao: data.referenciaLocalizacao?.trim() || null }),
      ...(data.ruralPropertyId !== undefined && {
        ruralPropertyId: data.ruralPropertyId?.trim() || null,
      }),
      ...(data.optanteProgramaLeite !== undefined && { optanteProgramaLeite: data.optanteProgramaLeite }),
    };
    await this.repo.update({ id, tenantId }, updates);
    if (data.participants !== undefined) {
      await this.upsertParticipants(id, data.participants);
    }
    const loaded = await this.findById(id, tenantId);
    if (!loaded) throw new Error('Failed to load state registration after update');
    return mapStateRegistrationToDTO(loaded);
  }

  private async upsertParticipants(
    stateRegistrationId: string,
    participants: { cpf: string; nome: string; participation?: string | null }[],
  ): Promise<void> {
    await this.participantRepo.delete({ stateRegistrationId });
    for (const p of participants) {
      if (!p.cpf?.trim() || !p.nome?.trim()) continue;
      const entity = this.participantRepo.create({
        stateRegistrationId,
        cpf: p.cpf.trim(),
        nome: p.nome.trim(),
        participation:
          p.participation !== undefined &&
          p.participation !== null &&
          `${p.participation}`.trim()
            ? `${p.participation}`.trim()
            : null,
      });
      await this.participantRepo.save(entity);
    }
  }
}
