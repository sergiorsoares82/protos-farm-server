import type { FarmRepository } from '../../../infrastructure/repositories/FarmRepository.js';
import type { CreateFarmRequestDTO, FarmResponseDTO } from '../../dtos/FarmDTOs.js';
import { mapFarmEntityToDTO } from './mapFarmToDTO.js';

export class CreateFarmUseCase {
  constructor(private farmRepository: FarmRepository) {}

  async execute(tenantId: string, data: CreateFarmRequestDTO): Promise<FarmResponseDTO> {
    if (!data.name?.trim()) throw new Error('Nome da fazenda é obrigatório');
    const payload: CreateFarmRequestDTO = {
      name: data.name.trim(),
    };
    if (data.location !== undefined && data.location !== '') payload.location = data.location;
    if (data.totalArea !== undefined) payload.totalArea = data.totalArea;
    if (data.tipoExploracao) payload.tipoExploracao = data.tipoExploracao;
    if (data.proprietarioNome != null) payload.proprietarioNome = data.proprietarioNome;
    if (data.dataInicioArrendamento != null) payload.dataInicioArrendamento = data.dataInicioArrendamento;
    if (data.dataFimArrendamento != null) payload.dataFimArrendamento = data.dataFimArrendamento;
    if (data.ruralPropertyIds != null && data.ruralPropertyIds.length > 0) payload.ruralPropertyIds = data.ruralPropertyIds;
    const entity = await this.farmRepository.create(tenantId, payload);
    return mapFarmEntityToDTO(entity);
  }
}
