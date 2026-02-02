export interface CreateInvoiceReceiptItemDTO {
  invoiceItemId: string;
  quantityReceived: number;
}

export interface CreateInvoiceReceiptDTO {
  receiptDate: string; // ISO date (yyyy-MM-dd)
  notes?: string | null;
  items: CreateInvoiceReceiptItemDTO[];
}

export interface InvoiceReceiptItemDTO {
  id: string;
  invoiceItemId: string;
  quantityReceived: number;
}

export interface InvoiceReceiptDTO {
  id: string;
  invoiceId: string;
  receiptDate: string;
  notes?: string | null;
  items: InvoiceReceiptItemDTO[];
  createdAt: string;
  updatedAt: string;
}
