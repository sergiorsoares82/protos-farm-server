import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireSuperAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';
import { DocumentTypeRepository } from '../../infrastructure/repositories/DocumentTypeRepository.js';
import { DocumentTypeController } from '../controllers/DocumentTypeController.js';

export function createDocumentTypeRoutes(): Router {
  const router = Router();

  router.use(authenticate);
  router.use(requireSuperAdmin);

  const repository = new DocumentTypeRepository();
  const controller = new DocumentTypeController(repository);

  const createSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    group: z.string().min(1, 'Group is required'),
    hasAccessKey: z.boolean(),
  });

  const updateSchema = z.object({
    name: z.string().min(1).optional(),
    group: z.string().min(1).optional(),
    hasAccessKey: z.boolean().optional(),
  });

  router.get('/', (req, res) => controller.list(req, res));

  router.post('/', validate(createSchema), (req, res) => controller.create(req, res));

  router.put('/:id', validate(updateSchema), (req, res) => controller.update(req, res));

  router.delete('/:id', (req, res) => controller.delete(req, res));

  return router;
}

