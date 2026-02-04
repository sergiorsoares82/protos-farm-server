import type { FarmEntity } from '../../../infrastructure/database/entities/FarmEntity.js';
import type { FarmResponseDTO } from '../../dtos/FarmDTOs.js';

export function mapFarmEntityToDTO(entity: FarmEntity): FarmResponseDTO {
  const owners = (entity.farmOwners || []).map((fo: any) => ({
    personId: fo.personId,
    personName: fo.person?.nome ?? '',
    ...(fo.ownershipType && { ownershipType: fo.ownershipType }),
  }));
  return {
    id: entity.id,
    tenantId: entity.tenantId,
    name: entity.name,
    ...(entity.location && { location: entity.location }),
    ...(entity.totalArea != null && { totalArea: Number(entity.totalArea) }),
    owners,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
  };
}
