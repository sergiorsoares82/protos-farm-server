import type { Request, Response } from 'express';
import { InvoiceFinancialsTypeService } from '../../application/services/InvoiceFinancialsTypeService.js';
import type {
  CreateInvoiceFinancialsTypeDTO,
  UpdateInvoiceFinancialsTypeDTO,
} from '../../application/dtos/InvoiceFinancialsTypeDTOs.js';
import { UserRole } from '../../domain/enums/UserRole.js';

export class InvoiceFinancialsTypeController {
  constructor(private readonly service: InvoiceFinancialsTypeService) {}

  async list(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const items = await this.service.list(tenantId);
      res.json(items.map((t) => t.toJSON()));
    } catch (error) {
      console.error('Error listing invoice financial types:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const { id } = req.params;
      const item = await this.service.getById(tenantId, id as string);
      res.json(item.toJSON());
    } catch (error) {
      console.error('Error fetching invoice financial type:', error);
      res.status(404).json({ error: 'Invoice financial type not found' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const data: CreateInvoiceFinancialsTypeDTO = req.body;
      const created = await this.service.create(tenantId, data, isSuperAdmin);
      res.status(201).json(created.toJSON());
    } catch (error) {
      console.error('Error creating invoice financial type:', error);
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const { id } = req.params;
      const data: UpdateInvoiceFinancialsTypeDTO = req.body;
      const updated = await this.service.update(tenantId, id as string, data, isSuperAdmin);
      res.json(updated.toJSON());
    } catch (error) {
      console.error('Error updating invoice financial type:', error);
      if (error instanceof Error && error.message.includes('cannot be edited')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(400).json({
          error: error instanceof Error ? error.message : 'Invalid request',
        });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const tenantId = user?.tenantId ?? null;
      const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
      const { id } = req.params;
      await this.service.delete(tenantId, id as string, isSuperAdmin);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting invoice financial type:', error);
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error instanceof Error && error.message.includes('cannot be deleted')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
