import { Router } from 'express';
import { WorkLocationController } from '../controllers/WorkLocationController.js';
import { WorkLocationService } from '../../application/services/WorkLocationService.js';
import { WorkLocationTypeService } from '../../application/services/WorkLocationTypeService.js';
import { SeasonService } from '../../application/services/SeasonService.js';
import { WorkLocationRepository } from '../../infrastructure/repositories/WorkLocationRepository.js';
import { WorkLocationTypeRepository } from '../../infrastructure/repositories/WorkLocationTypeRepository.js';
import { FieldSeasonRepository } from '../../infrastructure/repositories/FieldSeasonRepository.js';
import { SeasonRepository } from '../../infrastructure/repositories/SeasonRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { CostCenterCategoryRepository } from '../../infrastructure/repositories/CostCenterCategoryRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createWorkLocationRoutes(): Router {
  const router = Router();

  const workLocationRepository = new WorkLocationRepository();
  const workLocationTypeRepository = new WorkLocationTypeRepository();
  const fieldSeasonRepository = new FieldSeasonRepository();
  const seasonRepository = new SeasonRepository();
  const costCenterRepository = new CostCenterRepository();
  const categoryRepository = new CostCenterCategoryRepository();
  const seasonService = new SeasonService(
    seasonRepository,
    workLocationRepository,
    fieldSeasonRepository,
    costCenterRepository,
    categoryRepository,
  );
  const workLocationTypeService = new WorkLocationTypeService(workLocationTypeRepository);
  const workLocationService = new WorkLocationService(
    workLocationRepository,
    workLocationTypeRepository,
    workLocationTypeService,
  );
  const workLocationController = new WorkLocationController(
    workLocationService,
    fieldSeasonRepository,
    seasonService,
  );

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.FIELD), (req, res) => workLocationController.getAllWorkLocations(req, res));
  router.post('/', canCreateEntity(EntityType.FIELD), (req, res) => workLocationController.createWorkLocation(req, res));
  router.get('/:id/operation-context', canViewEntity(EntityType.FIELD), (req, res) =>
    workLocationController.getOperationContext(req, res),
  );
  router.get('/:id', canViewEntity(EntityType.FIELD), (req, res) => workLocationController.getWorkLocation(req, res));
  router.get('/:id/latest-season', canViewEntity(EntityType.FIELD_SEASON), (req, res) =>
    workLocationController.getLatestSeason(req, res),
  );
  router.put('/:id', canEditEntity(EntityType.FIELD), (req, res) => workLocationController.updateWorkLocation(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.FIELD), (req, res) =>
    workLocationController.deleteWorkLocation(req, res),
  );

  return router;
}
