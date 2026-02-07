import { Router } from 'express';
import { WorkLocationTypeController } from '../controllers/WorkLocationTypeController.js';
import { WorkLocationTypeService } from '../../application/services/WorkLocationTypeService.js';
import { WorkLocationTypeRepository } from '../../infrastructure/repositories/WorkLocationTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { requireOrgAdmin, canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createWorkLocationTypeRoutes(): Router {
  const router = Router();

  const workLocationTypeRepository = new WorkLocationTypeRepository();
  const workLocationTypeService = new WorkLocationTypeService(workLocationTypeRepository);
  const workLocationTypeController = new WorkLocationTypeController(workLocationTypeService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.WORK_LOCATION_TYPE), (req, res) => workLocationTypeController.getAllTypes(req, res));
  router.get('/:id', canViewEntity(EntityType.WORK_LOCATION_TYPE), (req, res) => workLocationTypeController.getType(req, res));

  router.use(requireOrgAdmin);
  router.post('/', canCreateEntity(EntityType.WORK_LOCATION_TYPE), (req, res) => workLocationTypeController.createType(req, res));
  router.put('/:id', canEditEntity(EntityType.WORK_LOCATION_TYPE), (req, res) => workLocationTypeController.updateType(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.WORK_LOCATION_TYPE), (req, res) => workLocationTypeController.deleteType(req, res));

  return router;
}
