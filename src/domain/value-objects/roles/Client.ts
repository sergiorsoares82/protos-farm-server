/**
 * Client Role Value Object
 * Represents client-specific data
 */
export interface ClientProps {
  companyName?: string;
  taxId?: string;
  preferredPaymentMethod?: string;
  creditLimit?: number;
}

export class Client {
  private readonly companyName?: string;
  private readonly taxId?: string;
  private readonly preferredPaymentMethod?: string;
  private readonly creditLimit?: number;

  constructor(props: ClientProps) {
    this.validateProps(props);
    if (props.companyName) this.companyName = props.companyName;
    if (props.taxId) this.taxId = props.taxId;
    if (props.preferredPaymentMethod) this.preferredPaymentMethod = props.preferredPaymentMethod;
    if (props.creditLimit !== undefined) this.creditLimit = props.creditLimit;
  }

  private validateProps(props: ClientProps): void {
    if (props.creditLimit !== undefined && props.creditLimit < 0) {
      throw new Error('Credit limit cannot be negative');
    }
  }

  getCompanyName(): string | undefined {
    return this.companyName;
  }

  getTaxId(): string | undefined {
    return this.taxId;
  }

  getPreferredPaymentMethod(): string | undefined {
    return this.preferredPaymentMethod;
  }

  getCreditLimit(): number | undefined {
    return this.creditLimit;
  }

  toJSON(): ClientProps {
    return {
      ...(this.companyName && { companyName: this.companyName }),
      ...(this.taxId && { taxId: this.taxId }),
      ...(this.preferredPaymentMethod && { preferredPaymentMethod: this.preferredPaymentMethod }),
      ...(this.creditLimit !== undefined && { creditLimit: this.creditLimit }),
    };
  }
}
