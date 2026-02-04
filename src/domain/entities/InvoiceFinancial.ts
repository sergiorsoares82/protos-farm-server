import { InvoiceFinancialStatus } from '../enums/InvoiceFinancialStatus.js';

export interface InvoiceFinancialProps {
  id: string;
  invoiceId: string;
  dueDate: Date;
  amount: number;
  paidAt?: Date | undefined;
  clearedAt?: Date | undefined;
  penalty?: number;
  interest?: number;
  bankAccountId?: string | null;
  invoiceFinancialsTypeId?: string | null;
  status: InvoiceFinancialStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parcela financeira da Nota Fiscal: data de vencimento, valor, multa, juros, conta bancária, tipo de pagamento e status.
 */
export class InvoiceFinancial {
  private readonly id: string;
  private readonly invoiceId: string;
  private dueDate: Date;
  private amount: number;
  private paidAt?: Date | undefined;
  private clearedAt?: Date | undefined;
  private penalty: number;
  private interest: number;
  private bankAccountId: string | null;
  private invoiceFinancialsTypeId: string | null;
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
    this.clearedAt = props.clearedAt;
    this.penalty = props.penalty ?? 0;
    this.interest = props.interest ?? 0;
    this.bankAccountId = props.bankAccountId ?? null;
    this.invoiceFinancialsTypeId = props.invoiceFinancialsTypeId ?? null;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    invoiceId: string,
    dueDate: Date,
    amount: number,
    options?: {
      paidAt?: Date;
      clearedAt?: Date;
      penalty?: number;
      interest?: number;
      bankAccountId?: string | null;
      invoiceFinancialsTypeId?: string | null;
    }
  ): InvoiceFinancial {
    const now = new Date();
    const status = dueDate < now ? InvoiceFinancialStatus.OVERDUE : InvoiceFinancialStatus.PENDING;
    const fin = new InvoiceFinancial({
      id: crypto.randomUUID(),
      invoiceId,
      dueDate,
      amount,
      clearedAt: options?.clearedAt,
      penalty: options?.penalty ?? 0,
      interest: options?.interest ?? 0,
      bankAccountId: options?.bankAccountId ?? null,
      invoiceFinancialsTypeId: options?.invoiceFinancialsTypeId ?? null,
      status,
      createdAt: now,
      updatedAt: now,
    });
    if (options?.paidAt) {
      fin.markAsPaid(options.paidAt);
    }
    if (options?.clearedAt) {
      fin.setClearedAt(options.clearedAt);
    }
    return fin;
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

  setClearedAt(clearedAt: Date): void {
    this.clearedAt = clearedAt;
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
  getClearedAt(): Date | undefined { return this.clearedAt; }
  getPenalty(): number { return this.penalty; }
  getInterest(): number { return this.interest; }
  getBankAccountId(): string | null { return this.bankAccountId; }
  getInvoiceFinancialsTypeId(): string | null { return this.invoiceFinancialsTypeId; }
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
      clearedAt: this.clearedAt,
      penalty: this.penalty,
      interest: this.interest,
      bankAccountId: this.bankAccountId,
      invoiceFinancialsTypeId: this.invoiceFinancialsTypeId,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
