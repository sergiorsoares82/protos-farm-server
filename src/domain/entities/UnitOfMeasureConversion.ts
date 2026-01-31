export interface UnitOfMeasureConversionProps {
  id: string;
  /** Null for system conversions (available to all organizations). */
  tenantId: string | null;
  fromUnitId: string;
  toUnitId: string;
  /** 1 fromUnit = factor * toUnit (e.g. 1 T = 1000 KG → factor 1000). */
  factor: number;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Conversion between two units: 1 fromUnit = factor * toUnit.
 * Example: 1 ton = 1000 kg → fromUnitId=T, toUnitId=KG, factor=1000.
 * System conversions (tenantId null) editable only by SuperAdmin.
 * Organization conversions editable by SuperAdmin (all) or OrgAdmin (own org).
 */
export class UnitOfMeasureConversion {
  private readonly id: string;
  private readonly tenantId: string | null;
  private readonly fromUnitId: string;
  private readonly toUnitId: string;
  private factor: number;
  private readonly isSystem: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UnitOfMeasureConversionProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.fromUnitId = props.fromUnitId;
    this.toUnitId = props.toUnitId;
    this.factor = props.factor;
    this.isSystem = props.isSystem;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string | null,
    fromUnitId: string,
    toUnitId: string,
    factor: number,
    isSystem = false,
  ): UnitOfMeasureConversion {
    if (fromUnitId === toUnitId) {
      throw new Error('From unit and to unit must be different');
    }
    const now = new Date();
    return new UnitOfMeasureConversion({
      id: crypto.randomUUID(),
      tenantId,
      fromUnitId,
      toUnitId,
      factor,
      isSystem,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: UnitOfMeasureConversionProps): void {
    if (!props.fromUnitId || !props.toUnitId) {
      throw new Error('From unit and to unit are required');
    }
    if (props.fromUnitId === props.toUnitId) {
      throw new Error('From unit and to unit must be different');
    }
    if (props.factor <= 0 || !Number.isFinite(props.factor)) {
      throw new Error('Factor must be a positive number');
    }
    if (props.tenantId == null && !props.isSystem) {
      throw new Error('Tenant ID is required for non-system conversions');
    }
  }

  updateFactor(factor: number): void {
    if (factor <= 0 || !Number.isFinite(factor)) {
      throw new Error('Factor must be a positive number');
    }
    this.factor = factor;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getTenantId(): string | null { return this.tenantId; }
  getFromUnitId(): string { return this.fromUnitId; }
  getToUnitId(): string { return this.toUnitId; }
  getFactor(): number { return this.factor; }
  getIsSystem(): boolean { return this.isSystem; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      fromUnitId: this.fromUnitId,
      toUnitId: this.toUnitId,
      factor: this.factor,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
