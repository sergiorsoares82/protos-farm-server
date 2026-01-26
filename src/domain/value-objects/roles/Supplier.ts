/**
 * Supplier Role Value Object
 * Represents supplier-specific data
 */
export interface SupplierProps {
  companyName: string;
  taxId: string;
  supplyCategories?: string;
  paymentTerms?: string;
}

export class Supplier {
  private readonly companyName: string;
  private readonly taxId: string;
  private readonly supplyCategories?: string;
  private readonly paymentTerms?: string;

  constructor(props: SupplierProps) {
    this.validateProps(props);
    this.companyName = props.companyName;
    this.taxId = props.taxId;
    if (props.supplyCategories) this.supplyCategories = props.supplyCategories;
    if (props.paymentTerms) this.paymentTerms = props.paymentTerms;
  }

  private validateProps(props: SupplierProps): void {
    if (!props.companyName || props.companyName.trim().length === 0) {
      throw new Error('Supplier company name is required');
    }
    if (!props.taxId || props.taxId.trim().length === 0) {
      throw new Error('Supplier tax ID is required');
    }
  }

  getCompanyName(): string {
    return this.companyName;
  }

  getTaxId(): string {
    return this.taxId;
  }

  getSupplyCategories(): string | undefined {
    return this.supplyCategories;
  }

  getPaymentTerms(): string | undefined {
    return this.paymentTerms;
  }

  toJSON(): SupplierProps {
    return {
      companyName: this.companyName,
      taxId: this.taxId,
      ...(this.supplyCategories && { supplyCategories: this.supplyCategories }),
      ...(this.paymentTerms && { paymentTerms: this.paymentTerms }),
    };
  }
}
