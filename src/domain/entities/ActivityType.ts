export interface ActivityTypeProps {
  id: string;
  /** Null = system type (created by super-admin, available to all organizations). */
  tenantId: string | null;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ActivityType {
  private readonly id: string;
  private readonly tenantId: string | null;
  private name: string;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: ActivityTypeProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(tenantId: string | null, name: string): ActivityType {
    const now = new Date();
    return new ActivityType({
      id: crypto.randomUUID(),
      tenantId,
      name,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: ActivityTypeProps): void {
    if (props.tenantId == null && props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
  }

  update(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    this.name = name;
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

  getTenantId(): string | null {
    return this.tenantId;
  }

  /** True when tenantId is null (created by super-admin, available to all orgs). */
  getIsSystem(): boolean {
    return this.tenantId === null;
  }

  getName(): string {
    return this.name;
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
      isActive: this.isActive,
      isSystem: this.getIsSystem(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
