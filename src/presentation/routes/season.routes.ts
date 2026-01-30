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

  router.get('/', (req, res) => seasonController.getAllSeasons(req, res));
  router.post('/', (req, res) => seasonController.createSeason(req, res));
  router.get('/:id', (req, res) => seasonController.getSeason(req, res));
  router.put('/:id', (req, res) => seasonController.updateSeason(req, res));
  router.delete('/:id', (req, res) => seasonController.deleteSeason(req, res));

  router.get('/:id/fields', (req, res) => seasonController.getSeasonFields(req, res));
  router.post('/:id/fields', (req, res) => seasonController.upsertSeasonField(req, res));
  router.delete('/:id/fields/:fieldId', (req, res) =>
    seasonController.deleteSeasonField(req, res),
  );

  return router;
}

