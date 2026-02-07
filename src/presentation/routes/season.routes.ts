import { Router } from 'express';
import { SeasonController } from '../controllers/SeasonController.js';
import { SeasonService } from '../../application/services/SeasonService.js';
import { SeasonRepository } from '../../infrastructure/repositories/SeasonRepository.js';
import { WorkLocationRepository } from '../../infrastructure/repositories/WorkLocationRepository.js';
import { FieldSeasonRepository } from '../../infrastructure/repositories/FieldSeasonRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { CostCenterCategoryRepository } from '../../infrastructure/repositories/CostCenterCategoryRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createSeasonRoutes(): Router {
  const router = Router();

  const seasonRepository = new SeasonRepository();
  const workLocationRepository = new WorkLocationRepository();
  const fieldSeasonRepository = new FieldSeasonRepository();
  const costCenterRepository = new CostCenterRepository();
  const categoryRepository = new CostCenterCategoryRepository();
  const seasonService = new SeasonService(
    seasonRepository,
    workLocationRepository,
    fieldSeasonRepository,
    costCenterRepository,
    categoryRepository,
  );
  const seasonController = new SeasonController(seasonService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.SEASON), (req, res) => seasonController.getAllSeasons(req, res));
  router.post('/', canCreateEntity(EntityType.SEASON), (req, res) => seasonController.createSeason(req, res));
  router.get('/:id', canViewEntity(EntityType.SEASON), (req, res) => seasonController.getSeason(req, res));
  router.put('/:id', canEditEntity(EntityType.SEASON), (req, res) => seasonController.updateSeason(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.SEASON), (req, res) => seasonController.deleteSeason(req, res));

  router.get('/:id/fields', canViewEntity(EntityType.FIELD_SEASON), (req, res) => seasonController.getSeasonFields(req, res));
  router.post('/:id/fields', canCreateEntity(EntityType.FIELD_SEASON), (req, res) => seasonController.upsertSeasonField(req, res));
  router.delete('/:id/fields/:fieldId', canDeleteEntity(EntityType.FIELD_SEASON), (req, res) =>
    seasonController.deleteSeasonField(req, res),
  );

  return router;
}

