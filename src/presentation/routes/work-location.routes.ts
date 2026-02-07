import { Router } from 'express';
import { WorkLocationController } from '../controllers/WorkLocationController.js';
import { WorkLocationService } from '../../application/services/WorkLocationService.js';
import { WorkLocationTypeService } from '../../application/services/WorkLocationTypeService.js';
import { WorkLocationRepository } from '../../infrastructure/repositories/WorkLocationRepository.js';
import { WorkLocationTypeRepository } from '../../infrastructure/repositories/WorkLocationTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createWorkLocationRoutes(): Router {
  const router = Router();

  const workLocationRepository = new WorkLocationRepository();
  const workLocationTypeRepository = new WorkLocationTypeRepository();
  const workLocationTypeService = new WorkLocationTypeService(workLocationTypeRepository);
  const workLocationService = new WorkLocationService(
    workLocationRepository,
    workLocationTypeRepository,
    workLocationTypeService,
  );
  const workLocationController = new WorkLocationController(workLocationService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.FIELD), (req, res) => workLocationController.getAllWorkLocations(req, res));
  router.post('/', canCreateEntity(EntityType.FIELD), (req, res) => workLocationController.createWorkLocation(req, res));
  router.get('/:id', canViewEntity(EntityType.FIELD), (req, res) => workLocationController.getWorkLocation(req, res));
  router.put('/:id', canEditEntity(EntityType.FIELD), (req, res) => workLocationController.updateWorkLocation(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.FIELD), (req, res) => workLocationController.deleteWorkLocation(req, res));

  return router;
}
