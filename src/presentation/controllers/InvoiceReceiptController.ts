import type { Request, Response } from 'express';
import type { InvoiceReceiptService } from '../../application/services/InvoiceReceiptService.js';
import type { CreateInvoiceReceiptDTO } from '../../application/dtos/InvoiceReceiptDTOs.js';

export class InvoiceReceiptController {
  constructor(private readonly receiptService: InvoiceReceiptService) {}

  async createReceipt(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      if (!invoiceId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal é obrigatório' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const body = req.body as CreateInvoiceReceiptDTO;
      const receipt = await this.receiptService.createReceipt(tenantId, invoiceId, body);
      res.status(201).json({
        success: true,
        data: receipt,
        message: 'Recebimento registrado com sucesso',
      });
    } catch (error) {
      console.error('Create receipt error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao registrar recebimento';
      if (message.includes('não encontrada') || message.includes('não encontrado')) {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async getReceiptsByInvoiceId(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      if (!invoiceId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal é obrigatório' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const receipts = await this.receiptService.getReceiptsByInvoiceId(tenantId, invoiceId);
      res.status(200).json({ success: true, data: receipts });
    } catch (error) {
      console.error('Get receipts by invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao listar recebimentos';
      if (message === 'Nota fiscal não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async deleteReceipt(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      const receiptId = Array.isArray(req.params.receiptId) ? req.params.receiptId[0] : req.params.receiptId;
      if (!invoiceId || !receiptId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal e do recebimento são obrigatórios' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      await this.receiptService.deleteReceipt(tenantId, invoiceId, receiptId);
      res.status(200).json({
        success: true,
        message: 'Recebimento excluído com sucesso. O estoque foi ajustado.',
      });
    } catch (error) {
      console.error('Delete receipt error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao excluir recebimento';
      if (message.includes('não encontrada') || message.includes('não encontrado')) {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }
}
