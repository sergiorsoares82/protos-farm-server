export interface CostCenterTreeNodeDTO {
  id: string;
  parentId: string | null;
  code: string;
  name?: string | null | undefined;
  description: string;
  kind: string;
  type: string;
  nivel: number;
  custoDireto: number;
  custoTotal: number;
  temFilhos: boolean;
}
