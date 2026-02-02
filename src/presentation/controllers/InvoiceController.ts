import type { Request, Response } from 'express';
import { InvoiceService } from '../../application/services/InvoiceService.js';
import type { InvoiceReceiptService } from '../../application/services/InvoiceReceiptService.js';
import type { CreateInvoiceDTO, UpdateInvoiceDTO } from '../../application/dtos/InvoiceDTOs.js';

export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly receiptService?: InvoiceReceiptService,
  ) {}

  async getAllInvoices(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const invoices = await this.invoiceService.getAllInvoices(tenantId);
      res.status(200).json({
        success: true,
        data: invoices.map((inv) => inv.toJSON()),
      });
    } catch (error) {
      console.error('Get all invoices error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao listar notas fiscais';
      res.status(400).json({ success: false, error: message });
    }
  }

  async getInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'ID inválido' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const invoice = await this.invoiceService.getInvoice(tenantId, id);
      let data: Record<string, unknown> = invoice.toJSON() as Record<string, unknown>;
      if (this.receiptService) {
        const receivedTotals = await this.receiptService.getReceivedTotalsByInvoiceId(tenantId, id);
        data = {
          ...data,
          items: invoice.getItems().map((item) => ({
            ...item.toJSON(),
            quantityReceivedTotal: receivedTotals[item.getId()] ?? 0,
          })),
        };
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      console.error('Get invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao buscar nota fiscal';
      if (message === 'Nota fiscal não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async createInvoice(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const body = req.body as CreateInvoiceDTO;
      const invoice = await this.invoiceService.createInvoice(tenantId, body);
      res.status(201).json({
        success: true,
        data: invoice.toJSON(),
        message: 'Nota fiscal criada com sucesso',
      });
    } catch (error) {
      console.error('Create invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao criar nota fiscal';
      res.status(400).json({ success: false, error: message });
    }
  }

  async updateInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'ID inválido' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const body = req.body as UpdateInvoiceDTO;
      const invoice = await this.invoiceService.updateInvoice(tenantId, id, body);
      res.status(200).json({
        success: true,
        data: invoice.toJSON(),
        message: 'Nota fiscal atualizada com sucesso',
      });
    } catch (error) {
      console.error('Update invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao atualizar nota fiscal';
      if (message === 'Nota fiscal não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async deleteInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: 'ID inválido' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      await this.invoiceService.deleteInvoice(tenantId, id);
      res.status(200).json({ success: true, message: 'Nota fiscal excluída com sucesso' });
    } catch (error) {
      console.error('Delete invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao excluir nota fiscal';
      if (message === 'Nota fiscal não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async markFinancialAsPaid(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId)
        ? req.params.invoiceId[0]
        : req.params.invoiceId;
      const financialId = Array.isArray(req.params.financialId)
        ? req.params.financialId[0]
        : req.params.financialId;
      if (!invoiceId || !financialId) {
        res.status(400).json({ success: false, error: 'IDs inválidos' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const paidAt = req.body?.paidAt ? new Date(req.body.paidAt) : undefined;
      const invoice = await this.invoiceService.markFinancialAsPaid(
        tenantId,
        invoiceId,
        financialId,
        paidAt
      );
      res.status(200).json({
        success: true,
        data: invoice.toJSON(),
        message: 'Parcela marcada como paga',
      });
    } catch (error) {
      console.error('Mark financial as paid error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao atualizar parcela';
      if (message === 'Nota fiscal não encontrada' || message === 'Parcela financeira não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }
}
