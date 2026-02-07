import { Router } from 'express';
import { OperationController } from '../controllers/OperationController.js';
import { OperationService } from '../../application/services/OperationService.js';
import { OperationRepository } from '../../infrastructure/repositories/OperationRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createOperationRoutes(): Router {
    const router = Router();
    const operationRepository = new OperationRepository();
    const operationService = new OperationService(operationRepository);
    const operationController = new OperationController(operationService);

    router.use(authenticate);
    router.use(tenantContextMiddleware);
    router.use(requireTenant);

    router.get('/', canViewEntity(EntityType.OPERATION), (req, res) => operationController.getAllOperations(req, res));
    router.post('/', canCreateEntity(EntityType.OPERATION), (req, res) => operationController.createOperation(req, res));
    router.get('/:id', canViewEntity(EntityType.OPERATION), (req, res) => operationController.getOperation(req, res));
    router.put('/:id', canEditEntity(EntityType.OPERATION), (req, res) => operationController.updateOperation(req, res));
    router.delete('/:id', canDeleteEntity(EntityType.OPERATION), (req, res) => operationController.deleteOperation(req, res));

    return router;
}
