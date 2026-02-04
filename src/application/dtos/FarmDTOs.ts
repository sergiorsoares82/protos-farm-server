export interface FarmRuralPropertyItemDTO {
  id: string;
  nomeImovelIncra: string;
  codigoSncr?: string | null;
  municipio?: string | null;
  uf?: string | null;
}

export interface FarmResponseDTO {
  id: string;
  tenantId: string;
  name: string;
  location?: string;
  totalArea?: number;
  ruralProperties: FarmRuralPropertyItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFarmRequestDTO {
  name: string;
  location?: string;
  totalArea?: number;
  ruralPropertyIds?: string[];
}

export interface UpdateFarmRequestDTO {
  name?: string;
  location?: string;
  totalArea?: number;
  ruralPropertyIds?: string[];
}
