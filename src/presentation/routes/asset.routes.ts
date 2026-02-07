import { Router } from 'express';
import { AssetController } from '../controllers/AssetController.js';
import { FullMachineController } from '../controllers/FullMachineController.js';
import { AssetService } from '../../application/services/AssetService.js';
import { MachineService } from '../../application/services/MachineService.js';
import { CostCenterService } from '../../application/services/CostCenterService.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { MachineRepository } from '../../infrastructure/repositories/MachineRepository.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createAssetRoutes(): Router {
  const router = Router();

  const assetRepository = new AssetRepository();
  const assetService = new AssetService(assetRepository);
  const assetController = new AssetController(assetService);

  const machineRepository = new MachineRepository();
  const machineTypeRepository = new MachineTypeRepository();
  const costCenterRepository = new CostCenterRepository();
  const machineService = new MachineService(
    machineRepository,
    machineTypeRepository,
    assetRepository,
  );
  const costCenterService = new CostCenterService(
    costCenterRepository,
    assetRepository,
  );
  const fullMachineController = new FullMachineController(
    assetService,
    machineService,
    costCenterService,
  );

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.ASSET), (req, res) => assetController.getAllAssets(req, res));
  router.post('/', canCreateEntity(EntityType.ASSET), (req, res) => assetController.createAsset(req, res));
  router.post('/full-machine', canCreateEntity(EntityType.ASSET), (req, res) =>
    fullMachineController.createFullMachine(req, res),
  );
  router.get('/:id', canViewEntity(EntityType.ASSET), (req, res) => assetController.getAsset(req, res));
  router.put('/:id', canEditEntity(EntityType.ASSET), (req, res) => assetController.updateAsset(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.ASSET), (req, res) => assetController.deleteAsset(req, res));

  return router;
}
