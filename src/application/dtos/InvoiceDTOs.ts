import { ItemType } from '../../domain/enums/ItemType.js';
import { InvoiceFinancialStatus } from '../../domain/enums/InvoiceFinancialStatus.js';
import { InvoiceType } from '../../domain/enums/InvoiceType.js';

export interface InvoiceItemDTO {
  id?: string;
  itemId: string;
  description?: string;
  itemType: ItemType;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineOrder: number;
}

export interface InvoiceFinancialDTO {
  id?: string;
  dueDate: string;
  amount: number;
  paidAt?: string;
  status?: InvoiceFinancialStatus;
}

export interface CreateInvoiceDTO {
  number: string;
  series?: string;
  issueDate: string;
  supplierId: string;
  documentTypeId?: string;
  notes?: string;
  type: InvoiceType;
  items: InvoiceItemDTO[];
  financials: InvoiceFinancialDTO[];
}

export interface UpdateInvoiceDTO {
  number?: string;
  series?: string;
  issueDate?: string;
  supplierId?: string;
  documentTypeId?: string;
  notes?: string;
  type?: InvoiceType;
  items?: InvoiceItemDTO[];
  financials?: InvoiceFinancialDTO[];
}

export interface UpdateInvoiceFinancialDTO {
  dueDate?: string;
  amount?: number;
  paidAt?: string;
  status?: InvoiceFinancialStatus;
}
