import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
import { MachineService } from '../../application/services/MachineService.js';
import { MachineRepository } from '../../infrastructure/repositories/MachineRepository.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createMachineRoutes(): Router {
  const router = Router();

  const machineRepository = new MachineRepository();
  const machineTypeRepository = new MachineTypeRepository();
  const assetRepository = new AssetRepository();
  const machineService = new MachineService(
    machineRepository,
    machineTypeRepository,
    assetRepository,
  );
  const machineController = new MachineController(machineService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.MACHINE), (req, res) => machineController.getAllMachines(req, res));
  router.post('/', canCreateEntity(EntityType.MACHINE), (req, res) => machineController.createMachine(req, res));
  router.get('/:id', canViewEntity(EntityType.MACHINE), (req, res) => machineController.getMachine(req, res));
  router.put('/:id', canEditEntity(EntityType.MACHINE), (req, res) => machineController.updateMachine(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.MACHINE), (req, res) => machineController.deleteMachine(req, res));

  return router;
}
