export interface DocumentTypeResponseDTO {
  id: string;
  tenantId: string | null;
  name: string;
  group: string;
  hasAccessKey: boolean;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentTypeRequestDTO {
  name: string;
  group: string;
  hasAccessKey: boolean;
  tenantId?: string | null;
}

export interface UpdateDocumentTypeRequestDTO {
  name?: string;
  group?: string;
  hasAccessKey?: boolean;
}

