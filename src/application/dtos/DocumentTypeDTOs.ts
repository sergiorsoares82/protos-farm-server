export interface DocumentTypeResponseDTO {
  id: string;
  name: string;
  group: string;
  hasAccessKey: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDocumentTypeRequestDTO {
  name: string;
  group: string;
  hasAccessKey: boolean;
}

export interface UpdateDocumentTypeRequestDTO {
  name?: string;
  group?: string;
  hasAccessKey?: boolean;
}

