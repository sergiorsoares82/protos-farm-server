export interface IManagementAccountCostCenterTypeRepository {
  linkAccountToType(accountId: string, costCenterType: string): Promise<void>;
  unlinkAccountFromType(accountId: string, costCenterType: string): Promise<void>;
  getTypesForAccount(accountId: string): Promise<string[]>;
  getAccountIdsForType(costCenterType: string, tenantId: string): Promise<string[]>;
}

