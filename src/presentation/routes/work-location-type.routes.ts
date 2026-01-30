import { Router } from 'express';
import { WorkLocationTypeController } from '../controllers/WorkLocationTypeController.js';
import { WorkLocationTypeService } from '../../application/services/WorkLocationTypeService.js';
import { WorkLocationTypeRepository } from '../../infrastructure/repositories/WorkLocationTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin } from '../middleware/authorize.js';

export function createWorkLocationTypeRoutes(): Router {
  const router = Router();

  const workLocationTypeRepository = new WorkLocationTypeRepository();
  const workLocationTypeService = new WorkLocationTypeService(workLocationTypeRepository);
  const workLocationTypeController = new WorkLocationTypeController(workLocationTypeService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => workLocationTypeController.getAllTypes(req, res));
  router.get('/:id', (req, res) => workLocationTypeController.getType(req, res));

  router.use(requireOrgAdmin);
  router.post('/', (req, res) => workLocationTypeController.createType(req, res));
  router.put('/:id', (req, res) => workLocationTypeController.updateType(req, res));
  router.delete('/:id', (req, res) => workLocationTypeController.deleteType(req, res));

  return router;
}
