import { ManagementAccount } from '../../domain/entities/ManagementAccount.js';
import type { IManagementAccountRepository } from '../../domain/repositories/IManagementAccountRepository.js';
import type { CreateManagementAccountDTO, UpdateManagementAccountDTO } from '../dtos/ManagementAccountDTOs.js';
import { AccountType } from '../../domain/enums/AccountType.js';
import type { IManagementAccountCostCenterTypeRepository } from '../../domain/repositories/IManagementAccountCostCenterTypeRepository.js';
import type { ICostCenterRepository } from '../../domain/repositories/ICostCenterRepository.js';

export class ManagementAccountService {
    constructor(
        private readonly accountRepository: IManagementAccountRepository,
        private readonly linkRepository?: IManagementAccountCostCenterTypeRepository,
        private readonly costCenterRepository?: ICostCenterRepository,
    ) { }

    async createAccount(tenantId: string, data: CreateManagementAccountDTO): Promise<ManagementAccount> {
        this.validateCodeInternal(data.code, data.type);

        // Check if code already exists
        const existing = await this.accountRepository.findByCode(data.code, tenantId);
        if (existing) {
            throw new Error(`Account with code '${data.code}' already exists`);
        }

        // Check if parent exists (for non-root accounts)
        if (data.code.includes('.')) {
            const parts = data.code.split('.');
            parts.pop(); // Remove last segment to get parent code
            const parentCode = parts.join('.');
            const parent = await this.accountRepository.findByCode(parentCode, tenantId);
            if (!parent) {
                throw new Error(`Parent account '${parentCode}' does not exist. Please create it first.`);
            }
            if (parent.getType() !== data.type) {
                throw new Error(`Account type must match parent type (${parent.getType()})`);
            }
        }

        const account = ManagementAccount.create(
            tenantId,
            data.code,
            data.description,
            data.type,
            data.categoryIds ?? [],
        );

        return this.accountRepository.save(account);
    }

    async getAccount(tenantId: string, id: string): Promise<ManagementAccount> {
        const account = await this.accountRepository.findById(id, tenantId);
        if (!account) {
            throw new Error('Management Account not found');
        }
        return account;
    }

    async updateAccount(tenantId: string, id: string, data: UpdateManagementAccountDTO): Promise<ManagementAccount> {
        const account = await this.getAccount(tenantId, id);

        // If code or type is changing, re-validate
        if ((data.code && data.code !== account.getCode()) || (data.type && data.type !== account.getType())) {
            const newCode = data.code || account.getCode();
            const newType = data.type || account.getType();

            this.validateCodeInternal(newCode, newType);

            if (data.code && data.code !== account.getCode()) {
                const existing = await this.accountRepository.findByCode(data.code, tenantId);
                if (existing) {
                    throw new Error(`Account with code '${data.code}' already exists`);
                }

                // Also check parent if moving to a new hierarchy
                if (newCode.includes('.')) {
                    const parts = newCode.split('.');
                    parts.pop();
                    const parentCode = parts.join('.');
                    const parent = await this.accountRepository.findByCode(parentCode, tenantId);
                    if (!parent) {
                        throw new Error(`Parent account '${parentCode}' does not exist.`);
                    }
                    if (parent.getType() !== newType) {
                        throw new Error(`Account type must match parent type (${parent.getType()})`);
                    }
                }
            }
        }

        if (data.code || data.description || data.type || data.categoryIds !== undefined) {
            account.update(
                data.code || account.getCode(),
                data.description || account.getDescription(),
                data.type || account.getType(),
                data.categoryIds !== undefined ? data.categoryIds : account.getCategoryIds(),
            );
        }

        if (data.isActive !== undefined) {
            if (data.isActive) {
                account.activate();
            } else {
                account.deactivate();
            }
        }

        return this.accountRepository.save(account);
    }

    private validateCodeInternal(code: string, type: AccountType): void {
        const codePattern = /^\d+(\.\d+)*$/;
        if (!codePattern.test(code)) {
            throw new Error('Invalid code format. Use format like 01, 01.01, 02.05 (numbers separated by dots).');
        }

        if (code.startsWith('01')) {
            if (type !== AccountType.REVENUE) {
                throw new Error("Code starting with '01' must be of type REVENUE (Receita).");
            }
        } else if (code.startsWith('02')) {
            if (type !== AccountType.EXPENSE) {
                throw new Error("Code starting with '02' must be of type EXPENSE (Despesa).");
            }
        } else {
            throw new Error("Code must start with '01' (Revenue) or '02' (Expense).");
        }
    }

    async deleteAccount(tenantId: string, id: string): Promise<void> {
        // Here we might check for dependencies before deleting
        await this.accountRepository.delete(id, tenantId);
    }

    async getAllAccounts(tenantId: string): Promise<ManagementAccount[]> {
        await this.ensureDefaultAccounts(tenantId);
        return this.accountRepository.findAll(tenantId);
    }

    async getTypesForAccount(accountId: string, tenantId: string): Promise<string[]> {
        if (!this.linkRepository) {
            return [];
        }
        const account = await this.accountRepository.findById(accountId, tenantId);
        if (!account) {
            throw new Error('Management Account not found');
        }
        return this.linkRepository.getTypesForAccount(accountId);
    }

    async linkAccountToCostCenterType(
        tenantId: string,
        accountId: string,
        costCenterType: string,
    ): Promise<void> {
        if (!this.linkRepository) return;
        const account = await this.accountRepository.findById(accountId, tenantId);
        if (!account) {
            throw new Error('Management Account not found');
        }
        await this.linkRepository.linkAccountToType(accountId, costCenterType);
    }

    async unlinkAccountFromCostCenterType(
        tenantId: string,
        accountId: string,
        costCenterType: string,
    ): Promise<void> {
        if (!this.linkRepository) return;
        const account = await this.accountRepository.findById(accountId, tenantId);
        if (!account) {
            throw new Error('Management Account not found');
        }
        await this.linkRepository.unlinkAccountFromType(accountId, costCenterType);
    }

    /**
     * Get management accounts applicable to a given cost center.
     * Falls back to all accounts if no link repository or cost center repository is provided.
     */
    async getAccountsForCostCenter(tenantId: string, costCenterId: string): Promise<ManagementAccount[]> {
        if (!this.linkRepository || !this.costCenterRepository) {
            // Fallback: return all accounts for the tenant
            return this.getAllAccounts(tenantId);
        }

        const costCenter = await this.costCenterRepository.findById(costCenterId, tenantId);
        if (!costCenter) {
            throw new Error('Cost Center not found');
        }

        const type = costCenter.getType();
        const accountIds = await this.linkRepository.getAccountIdsForType(type, tenantId);

        if (accountIds.length === 0) {
            // If no specific links configured, return all accounts as a safe fallback
            return this.getAllAccounts(tenantId);
        }

        const accounts = await this.accountRepository.findByIds(accountIds, tenantId);
        // Ensure they are ordered by code for UX consistency
        return accounts.sort((a, b) => a.getCode().localeCompare(b.getCode()));
    }

    private async ensureDefaultAccounts(tenantId: string): Promise<void> {
        const count = (await this.accountRepository.findAll(tenantId)).length;
        if (count === 0) {
            // Create default Revenue account
            const revenue = ManagementAccount.create(
                tenantId,
                '01',
                'Receitas',
                AccountType.REVENUE
            );
            await this.accountRepository.save(revenue);

            // Create default Expense account
            const expense = ManagementAccount.create(
                tenantId,
                '02',
                'Despesas',
                AccountType.EXPENSE
            );
            await this.accountRepository.save(expense);
        }
    }
}
