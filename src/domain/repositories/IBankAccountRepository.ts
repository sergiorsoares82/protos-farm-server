import type { BankAccount } from '../entities/BankAccount.js';

export interface IBankAccountRepository {
  findAll(tenantId: string): Promise<BankAccount[]>;
  findById(id: string, tenantId: string): Promise<BankAccount | null>;
  findByName(name: string, tenantId: string): Promise<BankAccount | null>;
  save(account: BankAccount): Promise<BankAccount>;
  delete(id: string, tenantId: string): Promise<void>;
}
