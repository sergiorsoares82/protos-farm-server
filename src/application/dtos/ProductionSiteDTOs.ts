export interface ProductionSiteResponseDTO {
  id: string;
  tenantId: string;
  farmId: string;
  nomeBloco: string;
  descricao?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
