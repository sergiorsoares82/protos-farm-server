import type { InvoiceShipment } from '../entities/InvoiceShipment.js';

export interface IInvoiceShipmentRepository {
  save(shipment: InvoiceShipment, tenantId: string): Promise<InvoiceShipment>;
  findById(id: string, tenantId: string): Promise<InvoiceShipment | null>;
  findByInvoiceId(invoiceId: string, tenantId: string): Promise<InvoiceShipment[]>;
  findByInvoiceIds(tenantId: string, invoiceIds: string[]): Promise<InvoiceShipment[]>;
  delete(id: string, tenantId: string): Promise<void>;
}
