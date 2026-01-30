export interface WorkLocationTypeProps {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  isTalhao: boolean;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User-managed work location type (e.g. Talhão, Galpão, Ordenha).
 * Only SuperAdmin and OrgAdmin can create/update/delete.
 */
export class WorkLocationType {
  private readonly id: string;
  private readonly tenantId: string;
  private code: string;
  private name: string;
  private readonly isTalhao: boolean;
  private readonly isSystem: boolean;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: WorkLocationTypeProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.isTalhao = props.isTalhao;
    this.isSystem = props.isSystem;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    code: string,
    name: string,
    isTalhao: boolean,
    isSystem = false,
  ): WorkLocationType {
    const now = new Date();
    return new WorkLocationType({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      isTalhao,
      isSystem,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: WorkLocationTypeProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(code: string, name: string): void {
    if (this.isSystem) {
      throw new Error('System work location type cannot be edited');
    }
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
    if (this.isSystem) {
      throw new Error('System work location type cannot be deactivated');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getCode(): string { return this.code; }
  getName(): string { return this.name; }
  getIsTalhao(): boolean { return this.isTalhao; }
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
      isTalhao: this.isTalhao,
      isSystem: this.isSystem,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
