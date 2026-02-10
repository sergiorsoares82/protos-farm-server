import { Router } from 'express';
import { CostCenterController } from '../controllers/CostCenterController.js';
import { CostCenterService } from '../../application/services/CostCenterService.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { CostCenterKindCategoryRepository } from '../../infrastructure/repositories/CostCenterKindCategoryRepository.js';
import { AssetRepository } from '../../infrastructure/repositories/AssetRepository.js';
import { MachineRepository } from '../../infrastructure/repositories/MachineRepository.js';
import { BuildingRepository } from '../../infrastructure/repositories/BuildingRepository.js';
import { MachineTypeRepository } from '../../infrastructure/repositories/MachineTypeRepository.js';
import { FieldRepository } from '../../infrastructure/repositories/FieldRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createCostCenterRoutes(): Router {
    const router = Router();

    const costCenterRepository = new CostCenterRepository();
    const kindCategoryRepository = new CostCenterKindCategoryRepository();
    const assetRepository = new AssetRepository();
    const machineRepository = new MachineRepository();
    const buildingRepository = new BuildingRepository();
    const machineTypeRepository = new MachineTypeRepository();
    const fieldRepository = new FieldRepository();
    const costCenterService = new CostCenterService(
        costCenterRepository,
        kindCategoryRepository,
        assetRepository,
        machineRepository,
        buildingRepository,
        machineTypeRepository,
        fieldRepository,
    );
    const costCenterController = new CostCenterController(costCenterService);

    router.use(authenticate);
    router.use(tenantContextMiddleware);
    router.use(requireTenant);

    router.get('/', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getAllCostCenters(req, res));
    router.get('/roots', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getRootCostCenters(req, res));
    router.get('/by-category/:categoryCode', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getCostCentersByCategory(req, res));
    router.get('/by-kind-category/:kindCategoryId', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getCostCentersByKindCategory(req, res));
    router.get('/children/:parentId', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getChildCostCenters(req, res));
    router.get('/tree-with-costs', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getTreeWithCosts(req, res));
    router.post('/', canCreateEntity(EntityType.COST_CENTER), (req, res) => costCenterController.createCostCenter(req, res));
    router.post('/machines', canCreateEntity(EntityType.COST_CENTER), (req, res) => costCenterController.createMachineWithCostCenter(req, res));
    router.post('/buildings', canCreateEntity(EntityType.COST_CENTER), (req, res) => costCenterController.createBuildingWithCostCenter(req, res));
    router.get('/:id', canViewEntity(EntityType.COST_CENTER), (req, res) => costCenterController.getCostCenter(req, res));
    router.put('/:id', canEditEntity(EntityType.COST_CENTER), (req, res) => costCenterController.updateCostCenter(req, res));
    router.delete('/:id', canDeleteEntity(EntityType.COST_CENTER), (req, res) => costCenterController.deleteCostCenter(req, res));

    return router;
}
