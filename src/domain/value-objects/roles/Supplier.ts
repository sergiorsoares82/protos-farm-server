/**
 * Supplier Role Value Object
 * Represents supplier-specific data (only supply_categories for now)
 */
export interface SupplierProps {
  supplyCategories?: string;
}

export class Supplier {
  private readonly supplyCategories?: string;

  constructor(props: SupplierProps) {
    if (props.supplyCategories) this.supplyCategories = props.supplyCategories;
  }

  getSupplyCategories(): string | undefined {
    return this.supplyCategories;
  }

  toJSON(): SupplierProps {
    return {
      ...(this.supplyCategories && { supplyCategories: this.supplyCategories }),
    };
  }
}
