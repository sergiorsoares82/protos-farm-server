export interface MachineProps {
  id: string;
  tenantId: string;
  costCenterId?: string | undefined;
  machineTypeId: string;
  brand?: string | undefined;
  model?: string | undefined;
  serialNumber?: string | undefined;
  horimeterInitial: number;
  horimeterCurrent?: number | undefined;
  powerHp?: number | undefined;
  fuelType?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Machine {
  private readonly id: string;
  private readonly tenantId: string;
  private costCenterId?: string | undefined;
  private machineTypeId: string;
  private brand?: string | undefined;
  private model?: string | undefined;
  private serialNumber?: string | undefined;
  private horimeterInitial: number;
  private horimeterCurrent?: number | undefined;
  private powerHp?: number | undefined;
  private fuelType?: string | undefined;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: MachineProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.costCenterId = props.costCenterId;
    this.machineTypeId = props.machineTypeId;
    this.brand = props.brand;
    this.model = props.model;
    this.serialNumber = props.serialNumber;
    this.horimeterInitial = props.horimeterInitial;
    this.horimeterCurrent = props.horimeterCurrent;
    this.powerHp = props.powerHp;
    this.fuelType = props.fuelType;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    costCenterId: string,
    machineTypeId: string,
    brand?: string,
    model?: string,
    serialNumber?: string,
    horimeterInitial: number = 0,
  ): Machine {
    const now = new Date();
    return new Machine({
      id: crypto.randomUUID(),
      tenantId,
      costCenterId,
      machineTypeId,
      brand,
      model,
      serialNumber,
      horimeterInitial,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: MachineProps): void {
    if (!props.machineTypeId || props.machineTypeId.trim().length === 0) {
      throw new Error('Machine type is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(
    machineTypeId: string,
    brand?: string,
    model?: string,
    serialNumber?: string,
    horimeterCurrent?: number,
    powerHp?: number,
    fuelType?: string,
  ): void {
    if (!machineTypeId || machineTypeId.trim().length === 0) {
      throw new Error('Machine type is required');
    }
    this.machineTypeId = machineTypeId;
    this.brand = brand;
    this.model = model;
    this.serialNumber = serialNumber;
    this.horimeterCurrent = horimeterCurrent;
    this.powerHp = powerHp;
    this.fuelType = fuelType;
    this.updatedAt = new Date();
  }

  setCostCenterId(costCenterId: string): void {
    this.costCenterId = costCenterId;
    this.updatedAt = new Date();
  }

  updateHorimeter(currentHorimeter: number): void {
    if (currentHorimeter < this.horimeterInitial) {
      throw new Error('Current horimeter cannot be less than initial horimeter');
    }
    this.horimeterCurrent = currentHorimeter;
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

  getCostCenterId(): string | undefined {
    return this.costCenterId;
  }

  getMachineTypeId(): string {
    return this.machineTypeId;
  }

  getBrand(): string | undefined {
    return this.brand;
  }

  getModel(): string | undefined {
    return this.model;
  }

  getSerialNumber(): string | undefined {
    return this.serialNumber;
  }

  getHorimeterInitial(): number {
    return this.horimeterInitial;
  }

  getHorimeterCurrent(): number | undefined {
    return this.horimeterCurrent;
  }

  getPowerHp(): number | undefined {
    return this.powerHp;
  }

  getFuelType(): string | undefined {
    return this.fuelType;
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
      costCenterId: this.costCenterId,
      machineTypeId: this.machineTypeId,
      brand: this.brand,
      model: this.model,
      serialNumber: this.serialNumber,
      horimeterInitial: this.horimeterInitial,
      horimeterCurrent: this.horimeterCurrent,
      powerHp: this.powerHp,
      fuelType: this.fuelType,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
