export interface CreateInvoiceShipmentItemDTO {
  invoiceItemId: string;
  quantityShipped: number;
}

export interface CreateInvoiceShipmentDTO {
  shipmentDate: string; // ISO date (yyyy-MM-dd)
  notes?: string | null;
  items: CreateInvoiceShipmentItemDTO[];
}

export interface InvoiceShipmentItemDTO {
  id: string;
  invoiceItemId: string;
  quantityShipped: number;
}

export interface InvoiceShipmentDTO {
  id: string;
  invoiceId: string;
  shipmentDate: string;
  notes?: string | null;
  items: InvoiceShipmentItemDTO[];
  createdAt: string;
  updatedAt: string;
}
