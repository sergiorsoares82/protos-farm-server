export interface MachineProps {
  id: string;
  tenantId: string;
  name: string;
  machineTypeId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Machine {
  private readonly id: string;
  private readonly tenantId: string;
  private name: string;
  private machineTypeId: string;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: MachineProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.machineTypeId = props.machineTypeId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(tenantId: string, name: string, machineTypeId: string): Machine {
    const now = new Date();
    return new Machine({
      id: crypto.randomUUID(),
      tenantId,
      name,
      machineTypeId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: MachineProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Machine name is required');
    }
    if (!props.machineTypeId || props.machineTypeId.trim().length === 0) {
      throw new Error('Machine type is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(name: string, machineTypeId: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Machine name is required');
    }
    if (!machineTypeId || machineTypeId.trim().length === 0) {
      throw new Error('Machine type is required');
    }
    this.name = name;
    this.machineTypeId = machineTypeId;
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

  getId(): string {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getName(): string {
    return this.name;
  }

  getMachineTypeId(): string {
    return this.machineTypeId;
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
