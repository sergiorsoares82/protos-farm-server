import { Router } from 'express';
import { BankAccountController } from '../controllers/BankAccountController.js';
import { BankAccountService } from '../../application/services/BankAccountService.js';
import { BankAccountRepository } from '../../infrastructure/repositories/BankAccountRepository.js';
import { authenticate } from '../middleware/auth.js';
import {
  tenantContextMiddleware,
  requireTenant,
} from '../../infrastructure/middleware/tenantContext.js';
import { canViewEntity, canCreateEntity, canEditEntity, canDeleteEntity } from '../middleware/authorize.js';
import { EntityType } from '../../domain/enums/EntityType.js';

export function createBankAccountRoutes(): Router {
  const router = Router();

  const bankAccountRepository = new BankAccountRepository();
  const bankAccountService = new BankAccountService(bankAccountRepository);
  const bankAccountController = new BankAccountController(bankAccountService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', canViewEntity(EntityType.BANK_ACCOUNT), (req, res) => bankAccountController.getAllAccounts(req, res));
  router.post('/', canCreateEntity(EntityType.BANK_ACCOUNT), (req, res) => bankAccountController.createAccount(req, res));
  router.get('/:id', canViewEntity(EntityType.BANK_ACCOUNT), (req, res) => bankAccountController.getAccount(req, res));
  router.put('/:id', canEditEntity(EntityType.BANK_ACCOUNT), (req, res) =>
    bankAccountController.updateAccount(req, res),
  );
  router.delete('/:id', canDeleteEntity(EntityType.BANK_ACCOUNT), (req, res) =>
    bankAccountController.deleteAccount(req, res),
  );

  return router;
}
