import type { InvoiceItem } from './InvoiceItem.js';
import type { InvoiceFinancial } from './InvoiceFinancial.js';
import { InvoiceType } from '../enums/InvoiceType.js';

export interface InvoiceProps {
  id: string;
  tenantId: string;
  number: string;
  series?: string | undefined;
  issueDate: Date;
  /** Compra (DESPESA): emitente é o fornecedor */
  emitterSupplierId?: string | null;
  /** Venda (RECEITA): emitente é produtor rural ou empresa (State Registration) */
  emitterPartyId?: string | null;
  /** Venda (RECEITA): destinatário é o cliente */
  recipientClientId?: string | null;
  /** Compra (DESPESA): destinatário é produtor rural ou empresa */
  recipientPartyId?: string | null;
  documentTypeId?: string | undefined;
  notes?: string | undefined;
  type: InvoiceType;
  items: InvoiceItem[];
  financials: InvoiceFinancial[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Nota Fiscal: cabeçalho com número, série, data de emissão, emitente/destinatário
 * e relacionamentos com itens (produto/serviço) e parcelas financeiras (vencimentos).
 * RECEITA: emitente = produtor/empresa (party), destinatário = cliente.
 * DESPESA: emitente = fornecedor, destinatário = produtor/empresa (party).
 */
export class Invoice {
  private readonly id: string;
  private readonly tenantId: string;
  private number: string;
  private series?: string | undefined;
  private issueDate: Date;
  private emitterSupplierId: string | null;
  private emitterPartyId: string | null;
  private recipientClientId: string | null;
  private recipientPartyId: string | null;
  private documentTypeId?: string | undefined;
  private notes?: string | undefined;
  private type: InvoiceType;
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
    this.emitterSupplierId = props.emitterSupplierId ?? null;
    this.emitterPartyId = props.emitterPartyId ?? null;
    this.recipientClientId = props.recipientClientId ?? null;
    this.recipientPartyId = props.recipientPartyId ?? null;
    this.documentTypeId = props.documentTypeId;
    this.notes = props.notes;
    this.type = props.type;
    this.items = props.items ?? [];
    this.financials = props.financials ?? [];
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    number: string,
    issueDate: Date,
    type: InvoiceType,
    options: {
      emitterSupplierId?: string | null;
      emitterPartyId?: string | null;
      recipientClientId?: string | null;
      recipientPartyId?: string | null;
      series?: string;
      documentTypeId?: string;
      notes?: string;
    }
  ): Invoice {
    const now = new Date();
    return new Invoice({
      id: crypto.randomUUID(),
      tenantId,
      number,
      series: options.series,
      issueDate,
      emitterSupplierId: options.emitterSupplierId ?? null,
      emitterPartyId: options.emitterPartyId ?? null,
      recipientClientId: options.recipientClientId ?? null,
      recipientPartyId: options.recipientPartyId ?? null,
      documentTypeId: options.documentTypeId,
      notes: options.notes,
      type,
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
    if (props.type === InvoiceType.RECEITA) {
      if (!props.emitterPartyId?.trim()) throw new Error('Emitente (produtor/empresa) é obrigatório em nota de venda');
      if (!props.recipientClientId?.trim()) throw new Error('Destinatário (cliente) é obrigatório em nota de venda');
      if (props.emitterSupplierId?.trim() || props.recipientPartyId?.trim()) {
        throw new Error('Em nota de venda use apenas emitente produtor/empresa e destinatário cliente');
      }
    } else {
      if (!props.emitterSupplierId?.trim()) throw new Error('Emitente (fornecedor) é obrigatório em nota de compra');
      if (props.emitterPartyId?.trim() || props.recipientClientId?.trim()) {
        throw new Error('Em nota de compra use apenas emitente fornecedor e destinatário produtor/empresa');
      }
      // recipientPartyId obrigatório apenas na criação/edição; legado pode ter null
    }
  }

  updateHeader(
    number: string,
    issueDate: Date,
    type: InvoiceType,
    options: {
      emitterSupplierId?: string | null;
      emitterPartyId?: string | null;
      recipientClientId?: string | null;
      recipientPartyId?: string | null;
      series?: string;
      documentTypeId?: string;
      notes?: string;
    }
  ): void {
    if (!number?.trim()) throw new Error('Invoice number is required');
    if (!(issueDate instanceof Date) || Number.isNaN(issueDate.getTime())) {
      throw new Error('Issue date is invalid');
    }
    this.number = number;
    this.issueDate = issueDate;
    this.type = type;
    this.emitterSupplierId = options.emitterSupplierId ?? this.emitterSupplierId;
    this.emitterPartyId = options.emitterPartyId ?? this.emitterPartyId;
    this.recipientClientId = options.recipientClientId ?? this.recipientClientId;
    this.recipientPartyId = options.recipientPartyId ?? this.recipientPartyId;
    this.series = options.series;
    this.documentTypeId = options.documentTypeId;
    this.notes = options.notes;
    if (this.type === InvoiceType.RECEITA) {
      if (!this.emitterPartyId?.trim()) throw new Error('Emitente (produtor/empresa) é obrigatório em nota de venda');
      if (!this.recipientClientId?.trim()) throw new Error('Destinatário (cliente) é obrigatório em nota de venda');
      this.emitterSupplierId = null;
      this.recipientPartyId = null;
    } else {
      if (!this.emitterSupplierId?.trim()) throw new Error('Emitente (fornecedor) é obrigatório em nota de compra');
      this.emitterPartyId = null;
      this.recipientClientId = null;
      // recipientPartyId pode ser preenchido ou mantido
    }
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
  getEmitterSupplierId(): string | null { return this.emitterSupplierId; }
  getEmitterPartyId(): string | null { return this.emitterPartyId; }
  getRecipientClientId(): string | null { return this.recipientClientId; }
  getRecipientPartyId(): string | null { return this.recipientPartyId; }
  getDocumentTypeId(): string | undefined { return this.documentTypeId; }
  getNotes(): string | undefined { return this.notes; }
  getType(): InvoiceType { return this.type; }
  getItems(): InvoiceItem[] { return [...this.items]; }
  getFinancials(): InvoiceFinancial[] { return [...this.financials]; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  /** Legado: em DESPESA retorna emitterSupplierId; em RECEITA não usado. */
  getSupplierId(): string {
    if (this.type === InvoiceType.DESPESA && this.emitterSupplierId) return this.emitterSupplierId;
    return '';
  }

  toJSON(): Record<string, unknown> {
    const json: Record<string, unknown> = {
      id: this.id,
      tenantId: this.tenantId,
      number: this.number,
      series: this.series,
      issueDate: this.issueDate,
      emitterSupplierId: this.emitterSupplierId,
      emitterPartyId: this.emitterPartyId,
      recipientClientId: this.recipientClientId,
      recipientPartyId: this.recipientPartyId,
      documentTypeId: this.documentTypeId,
      notes: this.notes,
      type: this.type,
      items: this.items.map((i) => i.toJSON()),
      financials: this.financials.map((f) => f.toJSON()),
      itemsTotal: this.getItemsTotal(),
      financialsTotal: this.getFinancialsTotal(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };

    if ((this as any)._documentType) {
      json.documentType = (this as any)._documentType;
    }
    if ((this as any)._emitter) {
      json.emitter = (this as any)._emitter;
    }
    if ((this as any)._recipient) {
      json.recipient = (this as any)._recipient;
    }

    return json;
  }
}
