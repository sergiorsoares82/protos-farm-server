export interface UnitOfMeasureProps {
  id: string;
  /** Null for system units (available to all organizations). */
  tenantId: string | null;
  code: string;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Unit of measure (e.g. kg, L, un, ha).
 * System records (tenantId null) are editable only by SuperAdmin.
 * Organization records are editable by SuperAdmin (all orgs) or OrgAdmin (own org only).
 */
export class UnitOfMeasure {
  private readonly id: string;
  private readonly tenantId: string | null;
  private code: string;
  private name: string;
  private readonly isSystem: boolean;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UnitOfMeasureProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.isSystem = props.isSystem;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string | null,
    code: string,
    name: string,
    isSystem = false,
  ): UnitOfMeasure {
    const now = new Date();
    return new UnitOfMeasure({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      isSystem,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: UnitOfMeasureProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (props.tenantId == null && !props.isSystem) {
      throw new Error('Tenant ID is required for non-system units');
    }
  }

  update(code: string, name: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    this.code = code;
    this.name = name;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getTenantId(): string | null { return this.tenantId; }
  getCode(): string { return this.code; }
  getName(): string { return this.name; }
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
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
