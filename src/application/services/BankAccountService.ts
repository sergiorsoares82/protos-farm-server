import { BankAccount } from '../../domain/entities/BankAccount.js';
import type { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository.js';
import type {
  CreateBankAccountDTO,
  UpdateBankAccountDTO,
} from '../dtos/BankAccountDTOs.js';

export class BankAccountService {
  constructor(private readonly bankAccountRepository: IBankAccountRepository) {}

  async createAccount(
    tenantId: string,
    data: CreateBankAccountDTO,
  ): Promise<BankAccount> {
    const existing = await this.bankAccountRepository.findByName(
      data.name.trim(),
      tenantId,
    );
    if (existing) {
      throw new Error(`Bank account with name '${data.name}' already exists`);
    }
    const account = BankAccount.create(
      tenantId,
      data.name.trim(),
      data.bankName ?? null,
      data.agency ?? null,
      data.accountNumber ?? null,
    );
    return this.bankAccountRepository.save(account);
  }

  async getAccount(tenantId: string, id: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findById(id, tenantId);
    if (!account) {
      throw new Error('Bank account not found');
    }
    return account;
  }

  async updateAccount(
    tenantId: string,
    id: string,
    data: UpdateBankAccountDTO,
  ): Promise<BankAccount> {
    const account = await this.getAccount(tenantId, id);
    if (data.name !== undefined && data.name.trim() !== account.getName()) {
      const existing = await this.bankAccountRepository.findByName(
        data.name.trim(),
        tenantId,
      );
      if (existing) {
        throw new Error(`Bank account with name '${data.name}' already exists`);
      }
    }
    if (
      data.name !== undefined ||
      data.bankName !== undefined ||
      data.agency !== undefined ||
      data.accountNumber !== undefined
    ) {
      account.update(
        data.name ?? account.getName(),
        data.bankName !== undefined ? data.bankName : account.getBankName(),
        data.agency !== undefined ? data.agency : account.getAgency(),
        data.accountNumber !== undefined
          ? data.accountNumber
          : account.getAccountNumber(),
      );
    }
    if (data.isActive !== undefined) {
      if (data.isActive) {
        account.activate();
      } else {
        account.deactivate();
      }
    }
    return this.bankAccountRepository.save(account);
  }

  async deleteAccount(tenantId: string, id: string): Promise<void> {
    await this.bankAccountRepository.delete(id, tenantId);
  }

  async getAllAccounts(tenantId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.findAll(tenantId);
  }
}
