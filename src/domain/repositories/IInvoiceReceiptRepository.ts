import type { InvoiceReceipt } from '../entities/InvoiceReceipt.js';

/**
 * Repository interface for InvoiceReceipt (recebimento de nota com itens).
 */
export interface IInvoiceReceiptRepository {
  save(receipt: InvoiceReceipt, tenantId: string): Promise<InvoiceReceipt>;
  findById(id: string, tenantId: string): Promise<InvoiceReceipt | null>;
  findByInvoiceId(invoiceId: string, tenantId: string): Promise<InvoiceReceipt[]>;
  findByInvoiceIds(tenantId: string, invoiceIds: string[]): Promise<InvoiceReceipt[]>;
  delete(id: string, tenantId: string): Promise<void>;
}
