import { AssetKind } from '../enums/AssetKind.js';

export interface AssetProps {
  id: string;
  tenantId: string;
  name: string;
  code?: string | undefined;
  assetKind: AssetKind;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Asset {
  private readonly id: string;
  private readonly tenantId: string;
  private name: string;
  private code?: string | undefined;
  private assetKind: AssetKind;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: AssetProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name;
    this.code = props.code;
    this.assetKind = props.assetKind;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    name: string,
    assetKind: AssetKind,
    code?: string,
  ): Asset {
    const now = new Date();
    return new Asset({
      id: crypto.randomUUID(),
      tenantId,
      name,
      code,
      assetKind,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: AssetProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Asset name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(name: string, assetKind: AssetKind, code?: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Asset name is required');
    }
    this.name = name;
    this.assetKind = assetKind;
    this.code = code;
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

  getCode(): string | undefined {
    return this.code;
  }

  getAssetKind(): AssetKind {
    return this.assetKind;
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

  toJSON() {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      code: this.code,
      assetKind: this.assetKind,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
