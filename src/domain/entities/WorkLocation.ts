export interface WorkLocationProps {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  typeId: string;
  typeCode: string;
  isTalhao: boolean;
  areaHectares: number | null;
  costCenterId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class WorkLocation {
  private readonly id: string;
  private readonly tenantId: string;
  private code: string;
  private name: string;
  private typeId: string;
  private typeCode: string;
  private isTalhao: boolean;
  private areaHectares: number | null;
  private costCenterId: string | null;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: WorkLocationProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.code = props.code;
    this.name = props.name;
    this.typeId = props.typeId;
    this.typeCode = props.typeCode;
    this.isTalhao = props.isTalhao;
    this.areaHectares = props.areaHectares;
    this.costCenterId = props.costCenterId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    code: string,
    name: string,
    typeId: string,
    typeCode: string,
    isTalhao: boolean,
    areaHectares: number | null,
    costCenterId: string | null,
  ): WorkLocation {
    const now = new Date();
    return new WorkLocation({
      id: crypto.randomUUID(),
      tenantId,
      code,
      name,
      typeId,
      typeCode,
      isTalhao,
      areaHectares,
      costCenterId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: WorkLocationProps): void {
    if (!props.code || props.code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!props.typeId || props.typeId.trim().length === 0) {
      throw new Error('Work location type is required');
    }
    if (props.isTalhao) {
      if (props.areaHectares == null || props.areaHectares <= 0) {
        throw new Error('Area (hectares) is required and must be greater than zero for this type');
      }
      if (props.costCenterId != null && props.costCenterId.trim().length > 0) {
        throw new Error('This type must not have a direct cost center; use season link instead');
      }
    } else {
      if (!props.costCenterId || props.costCenterId.trim().length === 0) {
        throw new Error('Cost center is required for this type of work location');
      }
      if (props.areaHectares != null && props.areaHectares < 0) {
        throw new Error('Area (hectares) cannot be negative');
      }
    }
  }

  update(
    code: string,
    name: string,
    areaHectares: number | null,
    costCenterId: string | null,
    typeId?: string,
    typeCode?: string,
    isTalhao?: boolean,
  ): void {
    if (!code || code.trim().length === 0) {
      throw new Error('Code is required');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    const effectiveIsTalhao = isTalhao ?? this.isTalhao;
    if (effectiveIsTalhao) {
      if (areaHectares == null || areaHectares <= 0) {
        throw new Error('Area (hectares) is required and must be greater than zero for this type');
      }
      if (costCenterId != null && costCenterId.trim().length > 0) {
        throw new Error('This type must not have a direct cost center');
      }
    } else {
      if (!costCenterId || costCenterId.trim().length === 0) {
        throw new Error('Cost center is required for this type of work location');
      }
      if (areaHectares != null && areaHectares < 0) {
        throw new Error('Area (hectares) cannot be negative');
      }
    }

    this.code = code;
    this.name = name;
    this.areaHectares = areaHectares;
    this.costCenterId = costCenterId;
    if (typeId != null) this.typeId = typeId;
    if (typeCode != null) this.typeCode = typeCode;
    if (isTalhao != null) this.isTalhao = isTalhao;
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
  getCode(): string { return this.code; }
  getName(): string { return this.name; }
  getTypeId(): string { return this.typeId; }
  getTypeCode(): string { return this.typeCode; }
  getIsTalhao(): boolean { return this.isTalhao; }
  getAreaHectares(): number | null { return this.areaHectares; }
  getCostCenterId(): string | null { return this.costCenterId; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      code: this.code,
      name: this.name,
      typeId: this.typeId,
      typeCode: this.typeCode,
      isTalhao: this.isTalhao,
      areaHectares: this.areaHectares,
      costCenterId: this.costCenterId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
