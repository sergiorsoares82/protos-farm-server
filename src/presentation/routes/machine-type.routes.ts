import { Router } from 'express';
import { MachineTypeController } from '../controllers/MachineTypeController.js';
import { MachineTypeService } from '../../application/services/MachineTypeService.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createMachineTypeRoutes(): Router {
  const router = Router();

  const repository = new MachineTypeRepository();
  const service = new MachineTypeService(repository);
  const controller = new MachineTypeController(service);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => controller.getAllMachineTypes(req, res));
  router.post('/', (req, res) => controller.createMachineType(req, res));
  router.get('/:id', (req, res) => controller.getMachineType(req, res));
  router.put('/:id', (req, res) => controller.updateMachineType(req, res));
  router.delete('/:id', (req, res) => controller.deleteMachineType(req, res));

  return router;
}
