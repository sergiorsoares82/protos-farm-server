export interface InvoiceFinancialsTypeProps {
  id: string;
  /** Null for system types (available to all organizations). */
  tenantId: string | null;
  name: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tipo de pagamento (forma de pagamento) para parcelas financeiras de notas fiscais.
 * Tipos de sistema (tenant_id null) podem ser editados apenas pelo super admin.
 * Org admin pode visualizar os tipos do sistema e criar tipos próprios da organização.
 */
export class InvoiceFinancialsType {
  private readonly id: string;
  private readonly tenantId: string | null;
  private name: string;
  private readonly isSystem: boolean;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: InvoiceFinancialsTypeProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.isSystem = props.isSystem;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(tenantId: string | null, name: string, isSystem = false): InvoiceFinancialsType {
    const now = new Date();
    return new InvoiceFinancialsType({
      id: crypto.randomUUID(),
      tenantId,
      name: name.trim(),
      isSystem,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: InvoiceFinancialsTypeProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (props.tenantId == null && !props.isSystem) {
      throw new Error('Tenant ID is required for non-system types');
    }
  }

  update(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    this.name = name.trim();
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    if (this.isSystem) {
      throw new Error('System invoice financial type cannot be deactivated');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }
  getTenantId(): string | null {
    return this.tenantId;
  }
  getName(): string {
    return this.name;
  }
  getIsSystem(): boolean {
    return this.isSystem;
  }
  getIsActive(): boolean {
    return this.isActive;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
