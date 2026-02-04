export interface LandRegistryOwnerItemDTO {
  id: string;
  personId: string;
  personName: string;
  percentualPosse?: number | null;
  dataAquisicao?: string | null;
  dataBaixa?: string | null;
  tipoAquisicao?: string | null;
}

export interface LandRegistryResponseDTO {
  id: string;
  tenantId: string;
  ruralPropertyId?: string | null;
  numeroMatricula: string;
  cartorio: string;
  dataRegistro?: string | null;
  registro?: string | null;
  livroOuFicha?: string | null;
  areaHa?: number | null;
  municipio?: string | null;
  uf?: string | null;
  owners: LandRegistryOwnerItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpsertLandRegistryOwnersRequestDTO {
  owners: {
    personId: string;
    percentualPosse?: number;
    dataAquisicao?: string;
    tipoAquisicao?: string;
  }[];
}

export interface CreateLandRegistryRequestDTO {
  ruralPropertyId?: string | null;
  numeroMatricula: string;
  cartorio: string;
  dataRegistro?: string | null;
  registro?: string | null;
  livroOuFicha?: string | null;
  areaHa?: number;
  municipio?: string;
  uf?: string;
}
