import type { Request, Response } from 'express';
import { InvoiceType } from '../../domain/enums/InvoiceType.js';
import { InvoiceService } from '../../application/services/InvoiceService.js';
import type { InvoiceReceiptService } from '../../application/services/InvoiceReceiptService.js';
import type { InvoiceShipmentService } from '../../application/services/InvoiceShipmentService.js';
import type { CreateInvoiceDTO, UpdateInvoiceDTO } from '../../application/dtos/InvoiceDTOs.js';

export class InvoiceController {
  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly receiptService?: InvoiceReceiptService,
    private readonly shipmentService?: InvoiceShipmentService,
  ) {}

  async getAllInvoices(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant!.tenantId;
      const pendingReceipt = req.query.pendingReceipt === 'true' || req.query.pendingReceipt === '1';
      const withReceipts = req.query.withReceipts === 'true' || req.query.withReceipts === '1';
      const pendingShipment = req.query.pendingShipment === 'true' || req.query.pendingShipment === '1';
      const withShipments = req.query.withShipments === 'true' || req.query.withShipments === '1';
      let invoices = await this.invoiceService.getAllInvoices(tenantId);
      let receivedTotalsMap: Map<string, Record<string, number>> | null = null;
      let shippedTotalsMap: Map<string, Record<string, number>> | null = null;

      if (pendingReceipt || withReceipts) {
        invoices = invoices.filter((inv) => inv.getType() === InvoiceType.DESPESA);
      } else if (pendingShipment || withShipments) {
        invoices = invoices.filter((inv) => inv.getType() === InvoiceType.RECEITA);
      }

      if ((pendingReceipt || withReceipts) && this.receiptService) {
        const ids = invoices.map((inv) => inv.getId());
        receivedTotalsMap = await this.receiptService.getReceivedTotalsByInvoiceIds(tenantId, ids);
        if (pendingReceipt) {
          invoices = invoices.filter((inv) => {
            const totals = receivedTotalsMap!.get(inv.getId()) ?? {};
            return inv.getItems().some((item) => {
              if (!item.getGoesToStock()) return false;
              const received = totals[item.getId()] ?? 0;
              return item.getQuantity() - received > 0;
            });
          });
        } else if (withReceipts) {
          invoices = invoices.filter((inv) => {
            const totals = receivedTotalsMap!.get(inv.getId()) ?? {};
            return Object.keys(totals).length > 0;
          });
        }
      }

      if ((pendingShipment || withShipments) && this.shipmentService) {
        const ids = invoices.map((inv) => inv.getId());
        shippedTotalsMap = await this.shipmentService.getShippedTotalsByInvoiceIds(tenantId, ids);
        if (pendingShipment) {
          invoices = invoices.filter((inv) => {
            const totals = shippedTotalsMap!.get(inv.getId()) ?? {};
            return inv.getItems().some((item) => {
              if (!item.getGoesToStock()) return false;
              const shipped = totals[item.getId()] ?? 0;
              return item.getQuantity() - shipped > 0;
            });
          });
        } else if (withShipments) {
          invoices = invoices.filter((inv) => {
            const totals = shippedTotalsMap!.get(inv.getId()) ?? {};
            return Object.keys(totals).length > 0;
          });
        }
      }

      res.status(200).json({
        success: true,
        data: invoices.map((inv) => {
          const json = inv.toJSON() as Record<string, unknown>;
          if (receivedTotalsMap) {
            const totals = receivedTotalsMap.get(inv.getId()) ?? {};
            (json.items as Array<Record<string, unknown>>) = inv.getItems().map((item) => ({
              ...item.toJSON(),
              quantityReceivedTotal: totals[item.getId()] ?? 0,
            }));
          }
          if (shippedTotalsMap) {
            const totals = shippedTotalsMap.get(inv.getId()) ?? {};
            const currentItems = (json.items as Array<Record<string, unknown>>) ?? inv.getItems().map((i) => i.toJSON());
            (json.items as Array<Record<string, unknown>>) = inv.getItems().map((item) => {
              const base = currentItems.find((i) => i.id === item.getId()) ?? item.toJSON();
              return { ...base, quantityShippedTotal: totals[item.getId()] ?? 0 };
            });
          }
          return json;
        }),
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
      if (this.shipmentService && invoice.getType() === InvoiceType.RECEITA) {
        const shippedTotals = await this.shipmentService.getShippedTotalsByInvoiceId(tenantId, id);
        const currentItems = (data.items as Array<Record<string, unknown>>) ?? invoice.getItems().map((i) => i.toJSON());
        data = {
          ...data,
          items: invoice.getItems().map((item) => {
            const base = currentItems.find((i) => i.id === item.getId()) ?? item.toJSON();
            return { ...base, quantityShippedTotal: shippedTotals[item.getId()] ?? 0 };
          }),
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
      if (this.receiptService && body.items?.length) {
        const receiptItems: { invoiceItemId: string; quantityReceived: number }[] = [];
        const savedItems = invoice.getItems();
        for (let i = 0; i < body.items.length && i < savedItems.length; i++) {
          const dto = body.items[i];
          const item = savedItems[i];
          if (dto && item && dto.goesToStock && dto.received && dto.quantity > 0) {
            receiptItems.push({ invoiceItemId: item.getId(), quantityReceived: item.getQuantity() });
          }
        }
        if (receiptItems.length > 0) {
          await this.receiptService.createReceipt(tenantId, invoice.getId(), {
            receiptDate: invoice.getIssueDate().toISOString().slice(0, 10),
            items: receiptItems,
          });
        }
      }
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
      if (this.receiptService && body.items?.length) {
        const receiptItems: { invoiceItemId: string; quantityReceived: number }[] = [];
        const savedItems = invoice.getItems();
        for (let i = 0; i < body.items.length && i < savedItems.length; i++) {
          const dto = body.items[i];
          const item = savedItems[i];
          if (dto && item && dto.goesToStock && dto.received && dto.quantity > 0) {
            receiptItems.push({ invoiceItemId: item.getId(), quantityReceived: item.getQuantity() });
          }
        }
        if (receiptItems.length > 0) {
          await this.receiptService.createReceipt(tenantId, invoice.getId(), {
            receiptDate: invoice.getIssueDate().toISOString().slice(0, 10),
            items: receiptItems,
          });
        }
      }
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
