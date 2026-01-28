export interface SeasonProps {
  id: string;
  tenantId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Season {
  private readonly id: string;
  private readonly tenantId: string;
  private name: string;
  private startDate: Date;
  private endDate: Date;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: SeasonProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.startDate = props.startDate;
    this.endDate = props.endDate;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    name: string,
    startDate: Date,
    endDate: Date,
  ): Season {
    const now = new Date();
    return new Season({
      id: crypto.randomUUID(),
      tenantId,
      name,
      startDate,
      endDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: SeasonProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!(props.startDate instanceof Date) || Number.isNaN(props.startDate.getTime())) {
      throw new Error('Start date is invalid');
    }
    if (!(props.endDate instanceof Date) || Number.isNaN(props.endDate.getTime())) {
      throw new Error('End date is invalid');
    }
    if (props.startDate.getTime() > props.endDate.getTime()) {
      throw new Error('Start date must be before or equal to end date');
    }
  }

  update(name: string, startDate: Date, endDate: Date): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (startDate.getTime() > endDate.getTime()) {
      throw new Error('Start date must be before or equal to end date');
    }

    this.name = name;
    this.startDate = startDate;
    this.endDate = endDate;
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
  getTenantId(): string { return this.tenantId; }
  getName(): string { return this.name; }
  getStartDate(): Date { return this.startDate; }
  getEndDate(): Date { return this.endDate; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}

