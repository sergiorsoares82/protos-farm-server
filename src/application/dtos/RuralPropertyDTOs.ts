export interface RuralPropertyResponseDTO {
  id: string;
  tenantId: string;
  codigoSncr?: string | null;
  nirf?: string | null;
  nomeImovelIncra: string;
  municipio?: string | null;
  uf?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRuralPropertyRequestDTO {
  nomeImovelIncra: string;
  codigoSncr?: string;
  nirf?: string;
  municipio?: string;
  uf?: string;
}
