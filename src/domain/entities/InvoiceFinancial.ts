import { InvoiceFinancialStatus } from '../enums/InvoiceFinancialStatus.js';

export interface InvoiceFinancialProps {
  id: string;
  invoiceId: string;
  dueDate: Date;
  amount: number;
  paidAt?: Date | undefined;
  status: InvoiceFinancialStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parcela financeira da Nota Fiscal: data de vencimento, valor e status de pagamento.
 */
export class InvoiceFinancial {
  private readonly id: string;
  private readonly invoiceId: string;
  private dueDate: Date;
  private amount: number;
  private paidAt?: Date | undefined;
  private status: InvoiceFinancialStatus;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceFinancialProps) {
    this.validateProps(props);
    this.id = props.id;
    this.invoiceId = props.invoiceId;
    this.dueDate = props.dueDate;
    this.amount = props.amount;
    this.paidAt = props.paidAt;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(invoiceId: string, dueDate: Date, amount: number): InvoiceFinancial {
    const now = new Date();
    const status = dueDate < now ? InvoiceFinancialStatus.OVERDUE : InvoiceFinancialStatus.PENDING;
    return new InvoiceFinancial({
      id: crypto.randomUUID(),
      invoiceId,
      dueDate,
      amount,
      status,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceFinancialProps): void {
    if (!props.invoiceId?.trim()) throw new Error('Invoice ID is required');
    if (!(props.dueDate instanceof Date) || Number.isNaN(props.dueDate.getTime())) {
      throw new Error('Due date is invalid');
    }
    if (typeof props.amount !== 'number' || props.amount < 0) {
      throw new Error('Amount must be a non-negative number');
    }
  }

  markAsPaid(paidAt?: Date): void {
    this.paidAt = paidAt ?? new Date();
    this.status = InvoiceFinancialStatus.PAID;
    this.updatedAt = new Date();
  }

  markAsPending(): void {
    this.paidAt = undefined;
    this.status = InvoiceFinancialStatus.PENDING;
    this.updatedAt = new Date();
  }

  updateDueDateAndAmount(dueDate: Date, amount: number): void {
    if (!(dueDate instanceof Date) || Number.isNaN(dueDate.getTime())) {
      throw new Error('Due date is invalid');
    }
    if (typeof amount !== 'number' || amount < 0) throw new Error('Amount must be non-negative');
    this.dueDate = dueDate;
    this.amount = amount;
    if (this.status !== InvoiceFinancialStatus.PAID) {
      this.status = dueDate < new Date() ? InvoiceFinancialStatus.OVERDUE : InvoiceFinancialStatus.PENDING;
    }
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getInvoiceId(): string { return this.invoiceId; }
  getDueDate(): Date { return this.dueDate; }
  getAmount(): number { return this.amount; }
  getPaidAt(): Date | undefined { return this.paidAt; }
  getStatus(): InvoiceFinancialStatus { return this.status; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      dueDate: this.dueDate,
      amount: this.amount,
      paidAt: this.paidAt,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
