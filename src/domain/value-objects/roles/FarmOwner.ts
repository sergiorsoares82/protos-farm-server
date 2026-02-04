/**
 * Farm Owner Role Value Object.
 * Person has role FARM_OWNER; actual farm links are in Farm -> FarmOwnerEntity (N:N).
 * farmName is optional (legacy/placeholder when no farm is linked yet).
 */
export interface FarmOwnerProps {
  farmName?: string;
  farmLocation?: string;
  totalArea?: number;
  ownershipType?: string;
}

export class FarmOwner {
  private readonly farmName?: string;
  private readonly farmLocation?: string;
  private readonly totalArea?: number;
  private readonly ownershipType?: string;

  constructor(props: FarmOwnerProps = {}) {
    this.validateProps(props);
    if (props.farmName) this.farmName = props.farmName;
    if (props.farmLocation) this.farmLocation = props.farmLocation;
    if (props.totalArea !== undefined) this.totalArea = props.totalArea;
    if (props.ownershipType) this.ownershipType = props.ownershipType;
  }

  private validateProps(props: FarmOwnerProps): void {
    if (props.farmName !== undefined && props.farmName !== null && props.farmName.trim().length === 0) {
      throw new Error('Farm name cannot be empty when provided');
    }
    if (props.totalArea !== undefined && props.totalArea < 0) {
      throw new Error('Total area cannot be negative');
    }
  }

  getFarmName(): string | undefined {
    return this.farmName;
  }

  getFarmLocation(): string | undefined {
    return this.farmLocation;
  }

  getTotalArea(): number | undefined {
    return this.totalArea;
  }

  getOwnershipType(): string | undefined {
    return this.ownershipType;
  }

  toJSON(): FarmOwnerProps {
    return {
      ...(this.farmName && { farmName: this.farmName }),
      ...(this.farmLocation && { farmLocation: this.farmLocation }),
      ...(this.totalArea !== undefined && { totalArea: this.totalArea }),
      ...(this.ownershipType && { ownershipType: this.ownershipType }),
    };
  }
}
