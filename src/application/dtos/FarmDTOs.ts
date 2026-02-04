export interface FarmOwnerDTO {
  personId: string;
  personName: string;
  ownershipType?: string;
}

export interface FarmResponseDTO {
  id: string;
  tenantId: string;
  name: string;
  location?: string;
  totalArea?: number;
  owners: FarmOwnerDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFarmRequestDTO {
  name: string;
  location?: string;
  totalArea?: number;
  ownerIds: string[];
  ownershipTypeByPersonId?: Record<string, string>;
}

export interface UpdateFarmRequestDTO {
  name?: string;
  location?: string;
  totalArea?: number;
  ownerIds?: string[];
  ownershipTypeByPersonId?: Record<string, string>;
}
