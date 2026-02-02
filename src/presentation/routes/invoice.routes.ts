import { Router } from 'express';
import { InvoiceController } from '../controllers/InvoiceController.js';
import { InvoiceReceiptController } from '../controllers/InvoiceReceiptController.js';
import { InvoiceShipmentController } from '../controllers/InvoiceShipmentController.js';
import { InvoiceService } from '../../application/services/InvoiceService.js';
import { InvoiceReceiptService } from '../../application/services/InvoiceReceiptService.js';
import { InvoiceShipmentService } from '../../application/services/InvoiceShipmentService.js';
import { InvoiceRepository } from '../../infrastructure/repositories/InvoiceRepository.js';
import { InvoiceReceiptRepository } from '../../infrastructure/repositories/InvoiceReceiptRepository.js';
import { InvoiceShipmentRepository } from '../../infrastructure/repositories/InvoiceShipmentRepository.js';
import { StockMovementService } from '../../application/services/StockMovementService.js';
import { StockMovementTypeService } from '../../application/services/StockMovementTypeService.js';
import { StockMovementRepository } from '../../infrastructure/repositories/StockMovementRepository.js';
import { StockMovementTypeRepository } from '../../infrastructure/repositories/StockMovementTypeRepository.js';
import { ItemRepository } from '../../infrastructure/repositories/ItemRepository.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContextMiddleware, requireTenant } from '../../infrastructure/middleware/tenantContext.js';

export function createInvoiceRoutes(): Router {
  const router = Router();

  router.use(authenticate);
  router.use(tenantContextMiddleware);
  router.use(requireTenant);

  const invoiceRepository = new InvoiceRepository();
  const invoiceService = new InvoiceService(invoiceRepository);

  const invoiceReceiptRepository = new InvoiceReceiptRepository();
  const stockMovementRepository = new StockMovementRepository();
  const stockMovementTypeRepository = new StockMovementTypeRepository();
  const itemRepository = new ItemRepository();
  const stockMovementTypeService = new StockMovementTypeService(stockMovementTypeRepository);
  const stockMovementService = new StockMovementService(
    stockMovementRepository,
    stockMovementTypeRepository,
    itemRepository,
  );
  const invoiceReceiptService = new InvoiceReceiptService(
    invoiceRepository,
    invoiceReceiptRepository,
    stockMovementService,
    stockMovementTypeService,
  );

  const invoiceShipmentRepository = new InvoiceShipmentRepository();
  const invoiceShipmentService = new InvoiceShipmentService(
    invoiceRepository,
    invoiceShipmentRepository,
    stockMovementService,
    stockMovementTypeService,
  );

  const invoiceController = new InvoiceController(
    invoiceService,
    invoiceReceiptService,
    invoiceShipmentService,
  );
  const invoiceReceiptController = new InvoiceReceiptController(invoiceReceiptService);
  const invoiceShipmentController = new InvoiceShipmentController(invoiceShipmentService);

  router.get('/', (req, res) => invoiceController.getAllInvoices(req, res));
  router.get('/:invoiceId/receipts', (req, res) => invoiceReceiptController.getReceiptsByInvoiceId(req, res));
  router.post('/:invoiceId/receipts', (req, res) => invoiceReceiptController.createReceipt(req, res));
  router.delete('/:invoiceId/receipts/:receiptId', (req, res) => invoiceReceiptController.deleteReceipt(req, res));
  router.get('/:invoiceId/shipments', (req, res) => invoiceShipmentController.getShipmentsByInvoiceId(req, res));
  router.post('/:invoiceId/shipments', (req, res) => invoiceShipmentController.createShipment(req, res));
  router.delete('/:invoiceId/shipments/:shipmentId', (req, res) => invoiceShipmentController.deleteShipment(req, res));
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
