import { Router } from 'express';
import { ManagementAccountController } from '../controllers/ManagementAccountController.js';
import { ManagementAccountService } from '../../application/services/ManagementAccountService.js';
import { ManagementAccountRepository } from '../../infrastructure/repositories/ManagementAccountRepository.js';
import { ManagementAccountCostCenterTypeRepository } from '../../infrastructure/repositories/ManagementAccountCostCenterTypeRepository.js';
import { CostCenterRepository } from '../../infrastructure/repositories/CostCenterRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createManagementAccountRoutes(): Router {
    const router = Router();

    const accountRepository = new ManagementAccountRepository();
    const linkRepository = new ManagementAccountCostCenterTypeRepository();
    const costCenterRepository = new CostCenterRepository();
    const accountService = new ManagementAccountService(accountRepository, linkRepository, costCenterRepository);
    const accountController = new ManagementAccountController(accountService);

    router.use(authenticate);
    router.use(tenantContextMiddleware);
    router.use(requireTenant);

    router.get('/', canViewEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) => accountController.getAllAccounts(req, res));
    router.get('/by-cost-center/:costCenterId', canViewEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) =>
        accountController.getAccountsForCostCenter(req, res)
    );
  router.get('/:id/types', canViewEntity(EntityType.MANAGEMENT_ACCOUNT_COST_CENTER_TYPE), (req, res) => accountController.getAccountTypes(req, res));
  router.post('/:id/types', canCreateEntity(EntityType.MANAGEMENT_ACCOUNT_COST_CENTER_TYPE), (req, res) => accountController.linkAccountType(req, res));
  router.delete('/:id/types/:type', canDeleteEntity(EntityType.MANAGEMENT_ACCOUNT_COST_CENTER_TYPE), (req, res) => accountController.unlinkAccountType(req, res));
    router.post('/', canCreateEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) => accountController.createAccount(req, res));
    router.get('/:id', canViewEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) => accountController.getAccount(req, res));
    router.put('/:id', canEditEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) => accountController.updateAccount(req, res));
    router.delete('/:id', canDeleteEntity(EntityType.MANAGEMENT_ACCOUNT), (req, res) => accountController.deleteAccount(req, res));

    return router;
}
