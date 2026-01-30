export interface StockMovementProps {
  id: string;
  tenantId: string;
  movementDate: Date;
  stockMovementTypeId: string;
  itemId: string;
  unit: string;
  quantity: number;
  workLocationId: string | null;
  seasonId: string | null;
  costCenterId: string | null;
  managementAccountId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Movimento de estoque: data, tipo, produto, unidade, quantidade,
 * local de trabalho, safra, centro de custo, conta gerencial.
 */
export class StockMovement {
  private readonly id: string;
  private readonly tenantId: string;
  private movementDate: Date;
  private stockMovementTypeId: string;
  private itemId: string;
  private unit: string;
  private quantity: number;
  private workLocationId: string | null;
  private seasonId: string | null;
  private costCenterId: string | null;
  private managementAccountId: string | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: StockMovementProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.movementDate = props.movementDate;
    this.stockMovementTypeId = props.stockMovementTypeId;
    this.itemId = props.itemId;
    this.unit = props.unit;
    this.quantity = props.quantity;
    this.workLocationId = props.workLocationId;
    this.seasonId = props.seasonId;
    this.costCenterId = props.costCenterId;
    this.managementAccountId = props.managementAccountId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    movementDate: Date,
    stockMovementTypeId: string,
    itemId: string,
    unit: string,
    quantity: number,
    workLocationId: string | null,
    seasonId: string | null,
    costCenterId: string | null,
    managementAccountId: string | null,
  ): StockMovement {
    const now = new Date();
    return new StockMovement({
      id: crypto.randomUUID(),
      tenantId,
      movementDate,
      stockMovementTypeId,
      itemId,
      unit,
      quantity,
      workLocationId,
      seasonId,
      costCenterId,
      managementAccountId,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: StockMovementProps): void {
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!(props.movementDate instanceof Date) || Number.isNaN(props.movementDate.getTime())) {
      throw new Error('Movement date is invalid');
    }
    if (!props.stockMovementTypeId?.trim()) {
      throw new Error('Stock movement type is required');
    }
    if (!props.itemId?.trim()) {
      throw new Error('Item (product) is required');
    }
    if (!props.unit?.trim()) {
      throw new Error('Unit is required');
    }
    if (typeof props.quantity !== 'number' || props.quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
  }

  update(
    movementDate: Date,
    stockMovementTypeId: string,
    itemId: string,
    unit: string,
    quantity: number,
    workLocationId: string | null,
    seasonId: string | null,
    costCenterId: string | null,
    managementAccountId: string | null,
  ): void {
    if (!(movementDate instanceof Date) || Number.isNaN(movementDate.getTime())) {
      throw new Error('Movement date is invalid');
    }
    if (!stockMovementTypeId?.trim()) {
      throw new Error('Stock movement type is required');
    }
    if (!itemId?.trim()) {
      throw new Error('Item (product) is required');
    }
    if (!unit?.trim()) {
      throw new Error('Unit is required');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    this.movementDate = movementDate;
    this.stockMovementTypeId = stockMovementTypeId;
    this.itemId = itemId;
    this.unit = unit;
    this.quantity = quantity;
    this.workLocationId = workLocationId;
    this.seasonId = seasonId;
    this.costCenterId = costCenterId;
    this.managementAccountId = managementAccountId;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getMovementDate(): Date { return this.movementDate; }
  getStockMovementTypeId(): string { return this.stockMovementTypeId; }
  getItemId(): string { return this.itemId; }
  getUnit(): string { return this.unit; }
  getQuantity(): number { return this.quantity; }
  getWorkLocationId(): string | null { return this.workLocationId; }
  getSeasonId(): string | null { return this.seasonId; }
  getCostCenterId(): string | null { return this.costCenterId; }
  getManagementAccountId(): string | null { return this.managementAccountId; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      movementDate: this.movementDate,
      stockMovementTypeId: this.stockMovementTypeId,
      itemId: this.itemId,
      unit: this.unit,
      quantity: this.quantity,
      workLocationId: this.workLocationId,
      seasonId: this.seasonId,
      costCenterId: this.costCenterId,
      managementAccountId: this.managementAccountId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
