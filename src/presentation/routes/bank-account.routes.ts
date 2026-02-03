import { Router } from 'express';
import { BankAccountController } from '../controllers/BankAccountController.js';
import { BankAccountService } from '../../application/services/BankAccountService.js';
import { BankAccountRepository } from '../../infrastructure/repositories/BankAccountRepository.js';
import { authenticate } from '../middleware/auth.js';
import {
  tenantContextMiddleware,
  requireTenant,
} from '../../infrastructure/middleware/tenantContext.js';

export function createBankAccountRoutes(): Router {
  const router = Router();

  const bankAccountRepository = new BankAccountRepository();
  const bankAccountService = new BankAccountService(bankAccountRepository);
  const bankAccountController = new BankAccountController(bankAccountService);

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  router.get('/', (req, res) => bankAccountController.getAllAccounts(req, res));
  router.post('/', (req, res) => bankAccountController.createAccount(req, res));
  router.get('/:id', (req, res) => bankAccountController.getAccount(req, res));
  router.put('/:id', (req, res) =>
    bankAccountController.updateAccount(req, res),
  );
  router.delete('/:id', (req, res) =>
    bankAccountController.deleteAccount(req, res),
  );

  return router;
}
