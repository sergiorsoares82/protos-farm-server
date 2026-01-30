import type { InvoiceItem } from './InvoiceItem.js';
import type { InvoiceFinancial } from './InvoiceFinancial.js';

export interface InvoiceProps {
  id: string;
  tenantId: string;
  number: string;
  series?: string | undefined;
  issueDate: Date;
  supplierId: string;
  documentTypeId?: string | undefined;
  notes?: string | undefined;
  items: InvoiceItem[];
  financials: InvoiceFinancial[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Nota Fiscal: cabeçalho com número, série, data de emissão, fornecedor e relacionamentos
 * com itens (produto/serviço) e parcelas financeiras (vencimentos).
 */
export class Invoice {
  private readonly id: string;
  private readonly tenantId: string;
  private number: string;
  private series?: string | undefined;
  private issueDate: Date;
  private supplierId: string;
  private documentTypeId?: string | undefined;
  private notes?: string | undefined;
  private items: InvoiceItem[];
  private financials: InvoiceFinancial[];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.number = props.number;
    this.series = props.series;
    this.issueDate = props.issueDate;
    this.supplierId = props.supplierId;
    this.documentTypeId = props.documentTypeId;
    this.notes = props.notes;
    this.items = props.items ?? [];
    this.financials = props.financials ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    number: string,
    issueDate: Date,
    supplierId: string,
    series?: string,
    documentTypeId?: string,
    notes?: string
  ): Invoice {
    const now = new Date();
    return new Invoice({
      id: crypto.randomUUID(),
      tenantId,
      number,
      series,
      issueDate,
      supplierId,
      documentTypeId,
      notes,
      items: [],
      financials: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceProps): void {
    if (!props.tenantId?.trim()) throw new Error('Tenant ID is required');
    if (!props.number?.trim()) throw new Error('Invoice number is required');
    if (!(props.issueDate instanceof Date) || Number.isNaN(props.issueDate.getTime())) {
      throw new Error('Issue date is invalid');
    }
    if (!props.supplierId?.trim()) throw new Error('Supplier is required');
  }

  updateHeader(
    number: string,
    issueDate: Date,
    supplierId: string,
    series?: string,
    documentTypeId?: string,
    notes?: string
  ): void {
    if (!number?.trim()) throw new Error('Invoice number is required');
    if (!(issueDate instanceof Date) || Number.isNaN(issueDate.getTime())) {
      throw new Error('Issue date is invalid');
    }
    if (!supplierId?.trim()) throw new Error('Supplier is required');
    this.number = number;
    this.issueDate = issueDate;
    this.supplierId = supplierId;
    this.series = series;
    this.documentTypeId = documentTypeId;
    this.notes = notes;
    this.updatedAt = new Date();
  }

  addItem(item: InvoiceItem): void {
    this.items.push(item);
    this.updatedAt = new Date();
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter((i) => i.getId() !== itemId);
    this.updatedAt = new Date();
  }

  getItem(itemId: string): InvoiceItem | undefined {
    return this.items.find((i) => i.getId() === itemId);
  }

  addFinancial(financial: InvoiceFinancial): void {
    this.financials.push(financial);
    this.updatedAt = new Date();
  }

  removeFinancial(financialId: string): void {
    this.financials = this.financials.filter((f) => f.getId() !== financialId);
    this.updatedAt = new Date();
  }

  getItemsTotal(): number {
    return this.items.reduce((sum, i) => sum + i.getTotalPrice(), 0);
  }

  getFinancialsTotal(): number {
    return this.financials.reduce((sum, f) => sum + f.getAmount(), 0);
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getNumber(): string { return this.number; }
  getSeries(): string | undefined { return this.series; }
  getIssueDate(): Date { return this.issueDate; }
  getSupplierId(): string { return this.supplierId; }
  getDocumentTypeId(): string | undefined { return this.documentTypeId; }
  getNotes(): string | undefined { return this.notes; }
  getItems(): InvoiceItem[] { return [...this.items]; }
  getFinancials(): InvoiceFinancial[] { return [...this.financials]; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      number: this.number,
      series: this.series,
      issueDate: this.issueDate,
      supplierId: this.supplierId,
      documentTypeId: this.documentTypeId,
      notes: this.notes,
      items: this.items.map((i) => i.toJSON()),
      financials: this.financials.map((f) => f.toJSON()),
      itemsTotal: this.getItemsTotal(),
      financialsTotal: this.getFinancialsTotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
