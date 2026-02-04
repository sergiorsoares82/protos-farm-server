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
  createdAt: Date;
  updatedAt: Date;
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
