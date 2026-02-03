export interface BankAccountProps {
  id: string;
  tenantId: string;
  name: string;
  bankName?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BankAccount {
  private readonly id: string;
  private readonly tenantId: string;
  private name: string;
  private bankName: string | null;
  private agency: string | null;
  private accountNumber: string | null;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: BankAccountProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.name = props.name ?? '';
    this.bankName = props.bankName ?? null;
    this.agency = props.agency ?? null;
    this.accountNumber = props.accountNumber ?? null;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    name: string,
    bankName?: string | null,
    agency?: string | null,
    accountNumber?: string | null,
  ): BankAccount {
    const now = new Date();
    return new BankAccount({
      id: crypto.randomUUID(),
      tenantId,
      name,
      bankName: bankName ?? null,
      agency: agency ?? null,
      accountNumber: accountNumber ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: BankAccountProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  update(
    name: string,
    bankName?: string | null,
    agency?: string | null,
    accountNumber?: string | null,
  ): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Name is required');
    }
    this.name = name;
    this.bankName = bankName ?? null;
    this.agency = agency ?? null;
    this.accountNumber = accountNumber ?? null;
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
  getName(): string { return this.name; }
  getBankName(): string | null { return this.bankName; }
  getAgency(): string | null { return this.agency; }
  getAccountNumber(): string | null { return this.accountNumber; }
  getIsActive(): boolean { return this.isActive; }
  getCreatedAt(): Date { return this.createdAt; }
  getUpdatedAt(): Date { return this.updatedAt; }

  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      tenantId: this.tenantId,
      name: this.name,
      bankName: this.bankName,
      agency: this.agency,
      accountNumber: this.accountNumber,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
