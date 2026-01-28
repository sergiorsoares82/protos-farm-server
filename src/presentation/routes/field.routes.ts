import { Router } from 'express';
import { FieldController } from '../controllers/FieldController.js';
import { FieldService } from '../../application/services/FieldService.js';
import { FieldRepository } from '../../infrastructure/repositories/FieldRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createFieldRoutes(): Router {
  const router = Router();

  const fieldRepository = new FieldRepository();
  const fieldService = new FieldService(fieldRepository);
  const fieldController = new FieldController(fieldService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => fieldController.getAllFields(req, res));
  router.post('/', (req, res) => fieldController.createField(req, res));
  router.get('/:id', (req, res) => fieldController.getField(req, res));
  router.put('/:id', (req, res) => fieldController.updateField(req, res));
  router.delete('/:id', (req, res) => fieldController.deleteField(req, res));

  return router;
}

