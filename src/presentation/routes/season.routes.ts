import { Router } from 'express';
import { SeasonController } from '../controllers/SeasonController.js';
import { SeasonService } from '../../application/services/SeasonService.js';
import { SeasonRepository } from '../../infrastructure/repositories/SeasonRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createSeasonRoutes(): Router {
  const router = Router();

  const seasonRepository = new SeasonRepository();
  const seasonService = new SeasonService(seasonRepository);
  const seasonController = new SeasonController(seasonService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => seasonController.getAllSeasons(req, res));
  router.post('/', (req, res) => seasonController.createSeason(req, res));
  router.get('/:id', (req, res) => seasonController.getSeason(req, res));
  router.put('/:id', (req, res) => seasonController.updateSeason(req, res));
  router.delete('/:id', (req, res) => seasonController.deleteSeason(req, res));

  return router;
}

