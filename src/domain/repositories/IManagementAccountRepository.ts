import { ManagementAccount } from '../entities/ManagementAccount.js';

export interface IManagementAccountRepository {
    findAll(tenantId: string): Promise<ManagementAccount[]>;
    findById(id: string, tenantId: string): Promise<ManagementAccount | null>;
    findByCode(code: string, tenantId: string): Promise<ManagementAccount | null>;
    findByIds(ids: string[], tenantId: string): Promise<ManagementAccount[]>;
    save(account: ManagementAccount): Promise<ManagementAccount>;
    delete(id: string, tenantId: string): Promise<void>;
}
