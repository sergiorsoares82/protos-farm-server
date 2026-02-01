import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin, requireOrgAdmin, canManageDocumentType } from '../middleware/authorize.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import { DocumentTypeRepository } from '../../infrastructure/repositories/DocumentTypeRepository.js';
import { DocumentTypeController } from '../controllers/DocumentTypeController.js';

export function createDocumentTypeRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  const repository = new DocumentTypeRepository();
  const controller = new DocumentTypeController(repository);

  const createSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    group: z.string().min(1, 'Group is required'),
    hasAccessKey: z.boolean(),
    tenantId: z.string().uuid().nullable().optional(),
  });

  const updateSchema = z.object({
    name: z.string().min(1).optional(),
    group: z.string().min(1).optional(),
    hasAccessKey: z.boolean().optional(),
  });

  // List: Super admin sees all, org admin sees system + their own
  router.get('/', requireOrgAdmin, (req, res) => controller.list(req, res));

  // Create: Super admin can create system types (tenantId = null) or org types, org admin can only create org types
  router.post('/', requireOrgAdmin, validate(createSchema), (req, res) => controller.create(req, res));

  // Update: Super admin can update all, org admin can only update their own (not system types)
  router.put('/:id', requireOrgAdmin, canManageDocumentType, validate(updateSchema), (req, res) => controller.update(req, res));

  // Delete: Super admin can delete all, org admin can only delete their own (not system types)
  router.delete('/:id', requireOrgAdmin, canManageDocumentType, (req, res) => controller.delete(req, res));

  return router;
}

