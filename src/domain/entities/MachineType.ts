export interface MachineTypeProps {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class MachineType {
  private readonly id: string;
  private readonly tenantId: string;
  private code: string;
  private name: string;
  private description?: string | undefined;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: MachineTypeProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    code: string,
    name: string,
    description?: string,
  ): MachineType {
    const now = new Date();
    return new MachineType({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: MachineTypeProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Machine type code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Machine type name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(code: string, name: string, description?: string): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Machine type code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Machine type name is required');
    }
    this.code = code;
    this.name = name;
    this.description = description;
    this.touch();
  }

  activate(): void {
    this.isActive = true;
    this.touch();
  }

  deactivate(): void {
    this.isActive = false;
    this.touch();
  }

  private touch(): void {
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getDescription(): string | undefined {
    return this.description;
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
}
