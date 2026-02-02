export interface InvoiceReceiptItemProps {
  id: string;
  receiptId: string;
  invoiceItemId: string;
  quantityReceived: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item de um Recebimento: referência ao item da nota e quantidade recebida neste recebimento.
 */
export class InvoiceReceiptItem {
  private readonly id: string;
  private readonly receiptId: string;
  private readonly invoiceItemId: string;
  private quantityReceived: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceReceiptItemProps) {
    this.validateProps(props);
    this.id = props.id;
    this.receiptId = props.receiptId;
    this.invoiceItemId = props.invoiceItemId;
    this.quantityReceived = props.quantityReceived;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(receiptId: string, invoiceItemId: string, quantityReceived: number): InvoiceReceiptItem {
    const now = new Date();
    return new InvoiceReceiptItem({
      id: crypto.randomUUID(),
      receiptId,
      invoiceItemId,
      quantityReceived,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceReceiptItemProps): void {
    if (!props.receiptId?.trim()) throw new Error('Receipt ID is required');
    if (!props.invoiceItemId?.trim()) throw new Error('Invoice item ID is required');
    if (typeof props.quantityReceived !== 'number' || props.quantityReceived <= 0) {
      throw new Error('Quantity received must be a positive number');
    }
  }

  getId(): string { return this.id; }
  getReceiptId(): string { return this.receiptId; }
  getInvoiceItemId(): string { return this.invoiceItemId; }
  getQuantityReceived(): number { return this.quantityReceived; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      receiptId: this.receiptId,
      invoiceItemId: this.invoiceItemId,
      quantityReceived: this.quantityReceived,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
