export interface BuildingProps {
  id: string;
  tenantId: string;
  costCenterId: string;
  areaM2?: number | undefined;
  landRegistry?: string | undefined;
  locationDetails?: string | undefined;
  constructionDate?: Date | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Building {
  private readonly id: string;
  private readonly tenantId: string;
  private costCenterId: string;
  private areaM2?: number | undefined;
  private landRegistry?: string | undefined;
  private locationDetails?: string | undefined;
  private constructionDate?: Date | undefined;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: BuildingProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.costCenterId = props.costCenterId;
    this.areaM2 = props.areaM2;
    this.landRegistry = props.landRegistry;
    this.locationDetails = props.locationDetails;
    this.constructionDate = props.constructionDate;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    costCenterId: string,
    areaM2?: number,
    landRegistry?: string,
    locationDetails?: string,
    constructionDate?: Date,
  ): Building {
    const now = new Date();
    return new Building({
      id: crypto.randomUUID(),
      tenantId,
      costCenterId,
      areaM2,
      landRegistry,
      locationDetails,
      constructionDate,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: BuildingProps): void {
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!props.costCenterId) {
      throw new Error('Cost Center ID is required');
    }
  }

  update(
    areaM2?: number,
    landRegistry?: string,
    locationDetails?: string,
    constructionDate?: Date,
  ): void {
    this.areaM2 = areaM2;
    this.landRegistry = landRegistry;
    this.locationDetails = locationDetails;
    this.constructionDate = constructionDate;
    this.updatedAt = new Date();
  }

  setCostCenterId(costCenterId: string): void {
    this.costCenterId = costCenterId;
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

  getCostCenterId(): string {
    return this.costCenterId;
  }

  getAreaM2(): number | undefined {
    return this.areaM2;
  }

  getLandRegistry(): string | undefined {
    return this.landRegistry;
  }

  getLocationDetails(): string | undefined {
    return this.locationDetails;
  }

  getConstructionDate(): Date | undefined {
    return this.constructionDate;
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
      areaM2: this.areaM2,
      landRegistry: this.landRegistry,
      locationDetails: this.locationDetails,
      constructionDate: this.constructionDate,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
