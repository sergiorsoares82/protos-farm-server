import { Router } from 'express';
import { OperationRecordController } from '../controllers/OperationRecordController.js';
import { OperationRecordService } from '../../application/services/OperationRecordService.js';
import { OperationRecordRepository } from '../../infrastructure/repositories/OperationRecordRepository.js';
import { OperationRepository } from '../../infrastructure/repositories/OperationRepository.js';
import { MachineRepository } from '../../infrastructure/repositories/MachineRepository.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { FieldRepository } from '../../infrastructure/repositories/FieldRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createOperationRecordRoutes(): Router {
  const router = Router();

  const operationRecordRepository = new OperationRecordRepository();
  const operationRepository = new OperationRepository();
  const machineRepository = new MachineRepository();
  const assetRepository = new AssetRepository();
  const fieldRepository = new FieldRepository();
  const costCenterRepository = new CostCenterRepository();
  const itemRepository = new ItemRepository();

  const operationRecordService = new OperationRecordService(
    operationRecordRepository,
    operationRepository,
    machineRepository,
    assetRepository,
    fieldRepository,
    costCenterRepository,
    itemRepository,
  );

  const operationRecordController = new OperationRecordController(operationRecordService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.OPERATION_RECORD), (req, res) => operationRecordController.getAllOperationRecords(req, res));
  router.post('/', canCreateEntity(EntityType.OPERATION_RECORD), (req, res) => operationRecordController.createOperationRecord(req, res));
  router.get('/:id', canViewEntity(EntityType.OPERATION_RECORD), (req, res) => operationRecordController.getOperationRecord(req, res));
  router.put('/:id', canEditEntity(EntityType.OPERATION_RECORD), (req, res) => operationRecordController.updateOperationRecord(req, res));
  router.delete('/:id', canDeleteEntity(EntityType.OPERATION_RECORD), (req, res) => operationRecordController.deleteOperationRecord(req, res));

  return router;
}
