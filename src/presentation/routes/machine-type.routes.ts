import { Router } from 'express';
import { MachineTypeController } from '../controllers/MachineTypeController.js';
import { MachineTypeService } from '../../application/services/MachineTypeService.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createMachineTypeRoutes(): Router {
  const router = Router();

  const repository = new MachineTypeRepository();
  const service = new MachineTypeService(repository);
  const controller = new MachineTypeController(service);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.MACHINE_TYPE), (req, res) => controller.getAllMachineTypes(req, res));
  router.post('/', canCreateEntity(EntityType.MACHINE_TYPE), (req, res) => controller.createMachineType(req, res));
  router.get('/:id', canViewEntity(EntityType.MACHINE_TYPE), (req, res) => controller.getMachineType(req, res));
  router.put('/:id', canEditEntity(EntityType.MACHINE_TYPE), (req, res) => controller.updateMachineType(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.MACHINE_TYPE), (req, res) => controller.deleteMachineType(req, res));

  return router;
}
