import type { CostCenterKindCategoryType } from '../enums/CostCenterKindCategoryType.js';
import { CostCenterKindCategoryTypeValues } from '../enums/CostCenterKindCategoryType.js';

export interface CostCenterKindCategoryProps {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  type: CostCenterKindCategoryType;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CostCenterKindCategory {
  private readonly id: string;
  private readonly tenantId: string;
  private code: string;
  private name: string;
  private type: CostCenterKindCategoryType;
  private sortOrder: number;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: CostCenterKindCategoryProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.type = props.type;
    this.sortOrder = props.sortOrder;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    code: string,
    name: string,
    type: CostCenterKindCategoryType,
    sortOrder: number = 0,
  ): CostCenterKindCategory {
    const now = new Date();
    return new CostCenterKindCategory({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      type,
      sortOrder,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: CostCenterKindCategoryProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Kind category code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Kind category name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!CostCenterKindCategoryTypeValues.includes(props.type)) {
      throw new Error(`Invalid kind category type: ${props.type}`);
    }
  }

  update(
    code: string,
    name: string,
    type?: CostCenterKindCategoryType,
    sortOrder?: number,
  ): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Kind category code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Kind category name is required');
    }
    this.code = code;
    this.name = name;
    if (type !== undefined) {
      if (!CostCenterKindCategoryTypeValues.includes(type)) {
        throw new Error(`Invalid kind category type: ${type}`);
      }
      this.type = type;
    }
    if (sortOrder !== undefined) {
      this.sortOrder = sortOrder;
    }
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

  getCode(): string {
    return this.code;
  }

  getName(): string {
    return this.name;
  }

  getType(): CostCenterKindCategoryType {
    return this.type;
  }

  getSortOrder(): number {
    return this.sortOrder;
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

  toJSON(): CostCenterKindCategoryProps {
    return {
      id: this.id,
      tenantId: this.tenantId,
      code: this.code,
      name: this.name,
      type: this.type,
      sortOrder: this.sortOrder,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
