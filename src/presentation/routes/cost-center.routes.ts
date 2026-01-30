import { Router } from 'express';
import { CostCenterController } from '../controllers/CostCenterController.js';
import { CostCenterService } from '../../application/services/CostCenterService.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createCostCenterRoutes(): Router {
    const router = Router();

    const costCenterRepository = new CostCenterRepository();
    const assetRepository = new AssetRepository();
    const costCenterService = new CostCenterService(
        costCenterRepository,
        assetRepository,
    );
    const costCenterController = new CostCenterController(costCenterService);

    router.use(authenticate);
    router.use(tenantContextMiddleware);
    router.use(requireTenant);

    router.get('/', (req, res) => costCenterController.getAllCostCenters(req, res));
    router.post('/', (req, res) => costCenterController.createCostCenter(req, res));
    router.get('/:id', (req, res) => costCenterController.getCostCenter(req, res));
    router.put('/:id', (req, res) => costCenterController.updateCostCenter(req, res));
    router.delete('/:id', (req, res) => costCenterController.deleteCostCenter(req, res));

    return router;
}
