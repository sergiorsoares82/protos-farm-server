import { InvoiceShipmentItem } from './InvoiceShipmentItem.js';

export interface InvoiceShipmentProps {
  id: string;
  tenantId: string;
  invoiceId: string;
  shipmentDate: Date;
  notes?: string | null;
  items?: InvoiceShipmentItem[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Saída (entrega) de uma Nota Fiscal de receita: data da saída, observações e itens (quantidades entregues por item da nota).
 */
export class InvoiceShipment {
  private readonly id: string;
  private readonly tenantId: string;
  private readonly invoiceId: string;
  private shipmentDate: Date;
  private notes: string | null;
  private readonly items: InvoiceShipmentItem[] = [];
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceShipmentProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.invoiceId = props.invoiceId;
    this.shipmentDate = props.shipmentDate;
    this.notes = props.notes ?? null;
    if (props.items?.length) {
      this.items.push(...props.items);
    }
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(tenantId: string, invoiceId: string, shipmentDate: Date, notes?: string | null): InvoiceShipment {
    const now = new Date();
    return new InvoiceShipment({
      id: crypto.randomUUID(),
      tenantId,
      invoiceId,
      shipmentDate,
      notes: notes ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceShipmentProps): void {
    if (!props.tenantId?.trim()) throw new Error('Tenant ID is required');
    if (!props.invoiceId?.trim()) throw new Error('Invoice ID is required');
    if (!(props.shipmentDate instanceof Date) || Number.isNaN(props.shipmentDate.getTime())) {
      throw new Error('Shipment date is invalid');
    }
  }

  addItem(item: InvoiceShipmentItem): void {
    if (item.getShipmentId() !== this.id) {
      throw new Error('Shipment item must belong to this shipment');
    }
    this.items.push(item);
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getInvoiceId(): string { return this.invoiceId; }
  getShipmentDate(): Date { return this.shipmentDate; }
  getNotes(): string | null { return this.notes; }
  getItems(): InvoiceShipmentItem[] { return [...this.items]; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      invoiceId: this.invoiceId,
      shipmentDate: this.shipmentDate,
      notes: this.notes,
      items: this.items.map((i) => i.toJSON()),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
