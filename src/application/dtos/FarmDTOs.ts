export interface FarmRuralPropertyItemDTO {
  id: string;
  nomeImovelIncra: string;
  codigoSncr?: string | null;
  municipio?: string | null;
  uf?: string | null;
}

export type FarmTipoExploracao = 'PROPRIO' | 'ARRENDADA';

export interface FarmResponseDTO {
  id: string;
  tenantId: string;
  name: string;
  location?: string;
  totalArea?: number;
  tipoExploracao: FarmTipoExploracao;
  proprietarioNome?: string | null;
  dataInicioArrendamento?: string | null;
  dataFimArrendamento?: string | null;
  ruralProperties: FarmRuralPropertyItemDTO[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFarmRequestDTO {
  name: string;
  location?: string;
  totalArea?: number;
  tipoExploracao?: FarmTipoExploracao;
  proprietarioNome?: string | null;
  dataInicioArrendamento?: string | null;
  dataFimArrendamento?: string | null;
  ruralPropertyIds?: string[];
}

export interface UpdateFarmRequestDTO {
  name?: string;
  location?: string;
  totalArea?: number;
  tipoExploracao?: FarmTipoExploracao;
  proprietarioNome?: string | null;
  dataInicioArrendamento?: string | null;
  dataFimArrendamento?: string | null;
  ruralPropertyIds?: string[];
}
