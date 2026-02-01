import type { DocumentType } from '../entities/DocumentType.js';

export interface IDocumentTypeRepository {
  findAll(): Promise<DocumentType[]>;
  findAllByTenant(tenantId: string | null): Promise<DocumentType[]>;
  findById(id: string): Promise<DocumentType | null>;
  findByNameAndGroup(name: string, group: string, tenantId?: string | null): Promise<DocumentType | null>;
  create(documentType: DocumentType): Promise<DocumentType>;
  update(documentType: DocumentType): Promise<DocumentType>;
  delete(id: string): Promise<void>;
}

