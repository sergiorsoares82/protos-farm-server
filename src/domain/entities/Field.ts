import { CostCenterType } from '../enums/CostCenterType.js';

export interface FieldProps {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  areaHectares: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Field {
  private readonly id: string;
  private readonly tenantId: string;
  private code: string;
  private name: string;
  private areaHectares: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: FieldProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.areaHectares = props.areaHectares;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    code: string,
    name: string,
    areaHectares: number,
  ): Field {
    const now = new Date();
    return new Field({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      areaHectares,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: FieldProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (props.areaHectares <= 0) {
      throw new Error('Area (hectares) must be greater than zero');
    }
  }

  update(code: string, name: string, areaHectares: number): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (areaHectares <= 0) {
      throw new Error('Area (hectares) must be greater than zero');
    }

    this.code = code;
    this.name = name;
    this.areaHectares = areaHectares;
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

  // Getters
  getId(): string { return this.id; }
  getTenantId(): string { return this.tenantId; }
  getCode(): string { return this.code; }
  getName(): string { return this.name; }
  getAreaHectares(): number { return this.areaHectares; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }
}

