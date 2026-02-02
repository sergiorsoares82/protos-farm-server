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
  costCenterId?: string | null;
  managementAccountId?: string | null;
  seasonId?: string | null;
  goesToStock?: boolean;
  /** Se true, ao salvar a nota cria recebimento no estoque com quantidade da linha e data de emissão */
  received?: boolean;
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
