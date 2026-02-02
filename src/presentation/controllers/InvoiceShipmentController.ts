import type { Request, Response } from 'express';
import type { InvoiceShipmentService } from '../../application/services/InvoiceShipmentService.js';
import type { CreateInvoiceShipmentDTO } from '../../application/dtos/InvoiceShipmentDTOs.js';

export class InvoiceShipmentController {
  constructor(private readonly shipmentService: InvoiceShipmentService) {}

  async createShipment(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      if (!invoiceId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal é obrigatório' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const body = req.body as CreateInvoiceShipmentDTO;
      const shipment = await this.shipmentService.createShipment(tenantId, invoiceId, body);
      res.status(201).json({
        success: true,
        data: shipment,
        message: 'Saída registrada com sucesso',
      });
    } catch (error) {
      console.error('Create shipment error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao registrar saída';
      if (message.includes('não encontrada') || message.includes('não encontrado')) {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async getShipmentsByInvoiceId(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      if (!invoiceId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal é obrigatório' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      const shipments = await this.shipmentService.getShipmentsByInvoiceId(tenantId, invoiceId);
      res.status(200).json({ success: true, data: shipments });
    } catch (error) {
      console.error('Get shipments by invoice error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao listar saídas';
      if (message === 'Nota fiscal não encontrada') {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }

  async deleteShipment(req: Request, res: Response): Promise<void> {
    try {
      const invoiceId = Array.isArray(req.params.invoiceId) ? req.params.invoiceId[0] : req.params.invoiceId;
      const shipmentId = Array.isArray(req.params.shipmentId) ? req.params.shipmentId[0] : req.params.shipmentId;
      if (!invoiceId || !shipmentId) {
        res.status(400).json({ success: false, error: 'ID da nota fiscal e da saída são obrigatórios' });
        return;
      }
      const tenantId = req.tenant!.tenantId;
      await this.shipmentService.deleteShipment(tenantId, invoiceId, shipmentId);
      res.status(200).json({
        success: true,
        message: 'Saída excluída com sucesso. O estoque foi ajustado.',
      });
    } catch (error) {
      console.error('Delete shipment error:', error);
      const message = error instanceof Error ? error.message : 'Falha ao excluir saída';
      if (message.includes('não encontrada') || message.includes('não encontrado')) {
        res.status(404).json({ success: false, error: message });
        return;
      }
      res.status(400).json({ success: false, error: message });
    }
  }
}
