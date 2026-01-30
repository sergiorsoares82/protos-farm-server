import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController.js';
import { InvoiceService } from '../../application/services/InvoiceService.js';
import { InvoiceRepository } from '../../infrastructure/repositories/InvoiceRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createInvoiceRoutes(): Router {
  const router = Router();

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const invoiceRepository = new InvoiceRepository();
  const invoiceService = new InvoiceService(invoiceRepository);
  const invoiceController = new InvoiceController(invoiceService);

  router.get('/', (req, res) => invoiceController.getAllInvoices(req, res));
  router.get('/:id', (req, res) => invoiceController.getInvoice(req, res));
  router.post('/', (req, res) => invoiceController.createInvoice(req, res));
  router.put('/:id', (req, res) => invoiceController.updateInvoice(req, res));
  router.delete('/:id', (req, res) => invoiceController.deleteInvoice(req, res));
  router.post(
    '/:invoiceId/financials/:financialId/mark-paid',
    (req, res) => invoiceController.markFinancialAsPaid(req, res)
  );

  return router;
}
