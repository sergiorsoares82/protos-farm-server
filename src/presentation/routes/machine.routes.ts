import { Router } from 'express';
import { MachineController } from '../controllers/MachineController.js';
import { MachineService } from '../../application/services/MachineService.js';
import { MachineRepository } from '../../infrastructure/repositories/MachineRepository.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

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

  router.get('/', (req, res) => machineController.getAllMachines(req, res));
  router.post('/', (req, res) => machineController.createMachine(req, res));
  router.get('/:id', (req, res) => machineController.getMachine(req, res));
  router.put('/:id', (req, res) => machineController.updateMachine(req, res));
  router.delete('/:id', (req, res) => machineController.deleteMachine(req, res));

  return router;
}
