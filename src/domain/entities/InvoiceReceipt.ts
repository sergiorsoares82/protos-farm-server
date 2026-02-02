import { InvoiceReceiptItem } from './InvoiceReceiptItem.js';

export interface InvoiceReceiptProps {
  id: string;
  tenantId: string;
  invoiceId: string;
  receiptDate: Date;
  notes?: string | null;
  items?: InvoiceReceiptItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Recebimento de uma Nota Fiscal: data do recebimento, observações e itens (quantidades recebidas por item da nota).
 */
export class InvoiceReceipt {
  private readonly id: string;
  private readonly tenantId: string;
  private readonly invoiceId: string;
  private receiptDate: Date;
  private notes: string | null;
  private readonly items: InvoiceReceiptItem[] = [];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceReceiptProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.invoiceId = props.invoiceId;
    this.receiptDate = props.receiptDate;
    this.notes = props.notes ?? null;
    if (props.items?.length) {
      this.items.push(...props.items);
    }
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(tenantId: string, invoiceId: string, receiptDate: Date, notes?: string | null): InvoiceReceipt {
    const now = new Date();
    return new InvoiceReceipt({
      id: crypto.randomUUID(),
      tenantId,
      invoiceId,
      receiptDate,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceReceiptProps): void {
    if (!props.tenantId?.trim()) throw new Error('Tenant ID is required');
    if (!props.invoiceId?.trim()) throw new Error('Invoice ID is required');
    if (!(props.receiptDate instanceof Date) || Number.isNaN(props.receiptDate.getTime())) {
      throw new Error('Receipt date is invalid');
    }
  }

  addItem(item: InvoiceReceiptItem): void {
    if (item.getReceiptId() !== this.id) {
      throw new Error('Receipt item must belong to this receipt');
    }
    this.items.push(item);
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getInvoiceId(): string { return this.invoiceId; }
  getReceiptDate(): Date { return this.receiptDate; }
  getNotes(): string | null { return this.notes; }
  getItems(): InvoiceReceiptItem[] { return [...this.items]; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      invoiceId: this.invoiceId,
      receiptDate: this.receiptDate,
      notes: this.notes,
      items: this.items.map((i) => i.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
