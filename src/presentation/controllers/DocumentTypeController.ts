import type { Request, Response } from 'express';
import type { IDocumentTypeRepository } from '../../domain/repositories/IDocumentTypeRepository.js';
import { GetDocumentTypesUseCase } from '../../application/use-cases/document-type/GetDocumentTypesUseCase.js';
import { CreateDocumentTypeUseCase } from '../../application/use-cases/document-type/CreateDocumentTypeUseCase.js';
import { UpdateDocumentTypeUseCase } from '../../application/use-cases/document-type/UpdateDocumentTypeUseCase.js';
import { DeleteDocumentTypeUseCase } from '../../application/use-cases/document-type/DeleteDocumentTypeUseCase.js';
import type {
  CreateDocumentTypeRequestDTO,
  UpdateDocumentTypeRequestDTO,
} from '../../application/dtos/DocumentTypeDTOs.js';

export class DocumentTypeController {
  private getUseCase: GetDocumentTypesUseCase;
  private createUseCase: CreateDocumentTypeUseCase;
  private updateUseCase: UpdateDocumentTypeUseCase;
  private deleteUseCase: DeleteDocumentTypeUseCase;
  private repository: IDocumentTypeRepository;

  constructor(repository: IDocumentTypeRepository) {
    this.repository = repository;
    this.getUseCase = new GetDocumentTypesUseCase(repository);
    this.createUseCase = new CreateDocumentTypeUseCase(repository);
    this.updateUseCase = new UpdateDocumentTypeUseCase(repository);
    this.deleteUseCase = new DeleteDocumentTypeUseCase(repository);
  }

  async list(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant?.tenantId ?? null;
      const result = await this.getUseCase.execute(tenantId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('List document types error:', error);
      const message = error instanceof Error ? error.message : 'Failed to list document types';
      res.status(400).json({ success: false, error: message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const payload = req.body as CreateDocumentTypeRequestDTO;
      const tenantId = req.user?.role === 'SUPER_ADMIN' ? (payload.tenantId ?? null) : req.tenant?.tenantId ?? null;
      const created = await this.createUseCase.execute(payload, tenantId);
      res.status(201).json({
        success: true,
        data: created,
        message: 'Document type created successfully',
      });
    } catch (error) {
      console.error('Create document type error:', error);
      const message = error instanceof Error ? error.message : 'Failed to create document type';
      res.status(400).json({ success: false, error: message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid ID parameter' });
        return;
      }
      
      // Check if user can edit system types
      const user = (req as any).user;
      const docType = await this.repository.findById(id);
      
      if (docType && docType.getIsSystem() && user.role !== 'SUPER_ADMIN') {
        res.status(403).json({ success: false, error: 'Cannot edit system document types' });
        return;
      }
      
      const payload = req.body as UpdateDocumentTypeRequestDTO;
      const updated = await this.updateUseCase.execute(id, payload);
      res.status(200).json({
        success: true,
        data: updated,
        message: 'Document type updated successfully',
      });
    } catch (error) {
      console.error('Update document type error:', error);
      const message = error instanceof Error ? error.message : 'Failed to update document type';
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        res.status(400).json({ success: false, error: 'Invalid ID parameter' });
        return;
      }
      await this.deleteUseCase.execute(id);
      res
        .status(200)
        .json({ success: true, message: 'Document type deleted successfully' });
    } catch (error) {
      console.error('Delete document type error:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete document type';
      const statusCode = message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({ success: false, error: message });
    }
  }
}

