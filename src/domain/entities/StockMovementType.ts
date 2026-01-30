import { StockMovementDirection } from '../enums/StockMovementDirection.js';

export interface StockMovementTypeProps {
  id: string;
  /** Null for system types (available to all organizations). */
  tenantId: string | null;
  code: string;
  name: string;
  direction: StockMovementDirection;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo de movimento de estoque (entrada inicial, compra, venda, consumo, ajustes).
 * Tipos de sistema têm tenant_id null e não podem ser editados/removidos.
 */
export class StockMovementType {
  private readonly id: string;
  private readonly tenantId: string | null;
  private code: string;
  private name: string;
  private direction: StockMovementDirection;
  private readonly isSystem: boolean;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: StockMovementTypeProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.direction = props.direction;
    this.isSystem = props.isSystem;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string | null,
    code: string,
    name: string,
    direction: StockMovementDirection,
    isSystem = false,
  ): StockMovementType {
    const now = new Date();
    return new StockMovementType({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      direction,
      isSystem,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: StockMovementTypeProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (props.tenantId == null && !props.isSystem) {
      throw new Error('Tenant ID is required for non-system types');
    }
    if (!Object.values(StockMovementDirection).includes(props.direction)) {
      throw new Error('Invalid direction');
    }
  }

  update(code: string, name: string, direction: StockMovementDirection): void {
    if (this.isSystem) {
      throw new Error('System stock movement type cannot be edited');
    }
    if (!code || code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!Object.values(StockMovementDirection).includes(direction)) {
      throw new Error('Invalid direction');
    }
    this.code = code;
    this.name = name;
    this.direction = direction;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    if (this.isSystem) {
      throw new Error('System stock movement type cannot be deactivated');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getTenantId(): string | null { return this.tenantId; }
  getCode(): string { return this.code; }
  getName(): string { return this.name; }
  getDirection(): StockMovementDirection { return this.direction; }
  getIsSystem(): boolean { return this.isSystem; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      code: this.code,
      name: this.name,
      direction: this.direction,
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
