import { Router } from 'express';
import { BuildingController } from '../controllers/BuildingController.js';
import { BuildingService } from '../../application/services/BuildingService.js';
import { BuildingRepository } from '../../infrastructure/repositories/BuildingRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createBuildingRoutes(): Router {
  const router = Router();

  const buildingRepository = new BuildingRepository();
  const buildingService = new BuildingService(buildingRepository);
  const buildingController = new BuildingController(buildingService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.COST_CENTER), (req, res) => buildingController.getAllBuildings(req, res));
  router.post('/', canCreateEntity(EntityType.COST_CENTER), (req, res) => buildingController.createBuilding(req, res));
  router.get('/:id', canViewEntity(EntityType.COST_CENTER), (req, res) => buildingController.getBuilding(req, res));
  router.put('/:id', canEditEntity(EntityType.COST_CENTER), (req, res) => buildingController.updateBuilding(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.COST_CENTER), (req, res) => buildingController.deleteBuilding(req, res));

  return router;
}
