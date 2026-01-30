import { ItemType } from '../enums/ItemType.js';

export interface InvoiceItemProps {
  id: string;
  invoiceId: string;
  itemId: string;
  description?: string | undefined;
  itemType: ItemType;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Item da Nota Fiscal: produto ou serviço com quantidade, unidade e preço.
 */
export class InvoiceItem {
  private readonly id: string;
  private readonly invoiceId: string;
  private itemId: string;
  private description?: string | undefined;
  private itemType: ItemType;
  private quantity: number;
  private unit: string;
  private unitPrice: number;
  private lineOrder: number;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceItemProps) {
    this.validateProps(props);
    this.id = props.id;
    this.invoiceId = props.invoiceId;
    this.itemId = props.itemId;
    this.description = props.description;
    this.itemType = props.itemType;
    this.quantity = props.quantity;
    this.unit = props.unit;
    this.unitPrice = props.unitPrice;
    this.lineOrder = props.lineOrder;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    invoiceId: string,
    itemId: string,
    itemType: ItemType,
    quantity: number,
    unit: string,
    unitPrice: number,
    lineOrder: number,
    description?: string
  ): InvoiceItem {
    const now = new Date();
    return new InvoiceItem({
      id: crypto.randomUUID(),
      invoiceId,
      itemId,
      description,
      itemType,
      quantity,
      unit,
      unitPrice,
      lineOrder,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceItemProps): void {
    if (!props.invoiceId?.trim()) throw new Error('Invoice ID is required');
    if (!props.itemId?.trim()) throw new Error('Item (product/service) is required');
    if (typeof props.quantity !== 'number' || props.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    if (!props.unit?.trim()) throw new Error('Unit is required');
    if (typeof props.unitPrice !== 'number' || props.unitPrice < 0) {
      throw new Error('Unit price must be a non-negative number');
    }
    if (typeof props.lineOrder !== 'number' || props.lineOrder < 0) {
      throw new Error('Line order must be a non-negative number');
    }
  }

  getTotalPrice(): number {
    return Number((this.quantity * this.unitPrice).toFixed(2));
  }

  update(
    itemId: string,
    itemType: ItemType,
    quantity: number,
    unit: string,
    unitPrice: number,
    lineOrder: number,
    description?: string
  ): void {
    if (!itemId?.trim()) throw new Error('Item is required');
    if (typeof quantity !== 'number' || quantity <= 0) throw new Error('Quantity must be positive');
    if (!unit?.trim()) throw new Error('Unit is required');
    if (typeof unitPrice !== 'number' || unitPrice < 0) throw new Error('Unit price must be non-negative');
    this.itemId = itemId;
    this.itemType = itemType;
    this.quantity = quantity;
    this.unit = unit;
    this.unitPrice = unitPrice;
    this.lineOrder = lineOrder;
    this.description = description;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getInvoiceId(): string { return this.invoiceId; }
  getItemId(): string { return this.itemId; }
  getDescription(): string | undefined { return this.description; }
  getItemType(): ItemType { return this.itemType; }
  getQuantity(): number { return this.quantity; }
  getUnit(): string { return this.unit; }
  getUnitPrice(): number { return this.unitPrice; }
  getLineOrder(): number { return this.lineOrder; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      invoiceId: this.invoiceId,
      itemId: this.itemId,
      description: this.description,
      itemType: this.itemType,
      quantity: this.quantity,
      unit: this.unit,
      unitPrice: this.unitPrice,
      totalPrice: this.getTotalPrice(),
      lineOrder: this.lineOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
