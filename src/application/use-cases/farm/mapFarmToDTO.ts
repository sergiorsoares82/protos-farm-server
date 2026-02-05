import type { FarmEntity } from '../../../infrastructure/database/entities/FarmEntity.js';
import type { FarmResponseDTO } from '../../dtos/FarmDTOs.js';

export function mapFarmEntityToDTO(entity: FarmEntity): FarmResponseDTO {
  const ruralProperties = (entity.farmRuralProperties || []).map((frp: any) => {
    const rp = frp.ruralProperty;
    return {
      id: rp.id,
      nomeImovelIncra: rp.nomeImovelIncra,
      codigoSncr: rp.codigoSncr ?? undefined,
      municipio: rp.municipio ?? undefined,
      uf: rp.uf ?? undefined,
    };
  });
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    name: entity.name,
    ...(entity.location && { location: entity.location }),
    ...(entity.totalArea != null && { totalArea: Number(entity.totalArea) }),
    tipoExploracao: (entity.tipoExploracao ?? 'PROPRIO') as 'PROPRIO' | 'ARRENDADA',
    ...(entity.proprietarioNome != null && { proprietarioNome: entity.proprietarioNome }),
    ...(entity.dataInicioArrendamento != null && { dataInicioArrendamento: entity.dataInicioArrendamento }),
    ...(entity.dataFimArrendamento != null && { dataFimArrendamento: entity.dataFimArrendamento }),
    ruralProperties,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
