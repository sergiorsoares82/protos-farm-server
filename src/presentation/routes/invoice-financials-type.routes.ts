import { Router } from 'express';
import { InvoiceFinancialsTypeController } from '../controllers/InvoiceFinancialsTypeController.js';
import { InvoiceFinancialsTypeService } from '../../application/services/InvoiceFinancialsTypeService.js';
import { InvoiceFinancialsTypeRepository } from '../../infrastructure/repositories/InvoiceFinancialsTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { requireOrgAdmin, canManageInvoiceFinancialType, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import { EntityType } from '../../domain/enums/EntityType.js';

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tenantId: z.string().uuid().nullable().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export function createInvoiceFinancialsTypeRoutes(): Router {
  const router = Router();

  const repository = new InvoiceFinancialsTypeRepository();
  const service = new InvoiceFinancialsTypeService(repository);
  const controller = new InvoiceFinancialsTypeController(service);

  router.use(authenticate);

  router.get('/', requireOrgAdmin, canViewEntity(EntityType.INVOICE_FINANCIALS_TYPE), (req, res) => controller.list(req, res));
  router.get('/:id', requireOrgAdmin, canViewEntity(EntityType.INVOICE_FINANCIALS_TYPE), (req, res) => controller.getById(req, res));

  router.post('/', requireOrgAdmin, canCreateEntity(EntityType.INVOICE_FINANCIALS_TYPE), validate(createSchema), (req, res) => controller.create(req, res));
  router.put('/:id', requireOrgAdmin, canManageInvoiceFinancialType, canEditEntity(EntityType.INVOICE_FINANCIALS_TYPE), validate(updateSchema), (req, res) =>
    controller.update(req, res),
  );
  router.delete('/:id', requireOrgAdmin, canManageInvoiceFinancialType, canDeleteEntity(EntityType.INVOICE_FINANCIALS_TYPE), (req, res) =>
    controller.delete(req, res),
  );

  return router;
}
