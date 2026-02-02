export interface InvoiceShipmentItemProps {
  id: string;
  shipmentId: string;
  invoiceItemId: string;
  quantityShipped: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item de uma Saída (entrega) de Nota Fiscal de receita: referência ao item da nota e quantidade entregue nesta saída.
 */
export class InvoiceShipmentItem {
  private readonly id: string;
  private readonly shipmentId: string;
  private readonly invoiceItemId: string;
  private quantityShipped: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceShipmentItemProps) {
    this.validateProps(props);
    this.id = props.id;
    this.shipmentId = props.shipmentId;
    this.invoiceItemId = props.invoiceItemId;
    this.quantityShipped = props.quantityShipped;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(shipmentId: string, invoiceItemId: string, quantityShipped: number): InvoiceShipmentItem {
    const now = new Date();
    return new InvoiceShipmentItem({
      id: crypto.randomUUID(),
      shipmentId,
      invoiceItemId,
      quantityShipped,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceShipmentItemProps): void {
    if (!props.shipmentId?.trim()) throw new Error('Shipment ID is required');
    if (!props.invoiceItemId?.trim()) throw new Error('Invoice item ID is required');
    if (typeof props.quantityShipped !== 'number' || props.quantityShipped <= 0) {
      throw new Error('Quantity shipped must be a positive number');
    }
  }

  getId(): string { return this.id; }
  getShipmentId(): string { return this.shipmentId; }
  getInvoiceItemId(): string { return this.invoiceItemId; }
  getQuantityShipped(): number { return this.quantityShipped; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      shipmentId: this.shipmentId,
      invoiceItemId: this.invoiceItemId,
      quantityShipped: this.quantityShipped,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
