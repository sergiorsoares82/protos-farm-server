import type { Invoice } from '../entities/Invoice.js';

/**
 * Repository interface for Invoice aggregate (nota fiscal with items and financials).
 */
export interface IInvoiceRepository {
  findAll(tenantId: string): Promise<Invoice[]>;
  findById(id: string, tenantId: string): Promise<Invoice | null>;
  save(invoice: Invoice, tenantId: string): Promise<Invoice>;
  delete(id: string, tenantId: string): Promise<void>;
  existsByNumber(number: string, tenantId: string, excludeId?: string): Promise<boolean>;
}
