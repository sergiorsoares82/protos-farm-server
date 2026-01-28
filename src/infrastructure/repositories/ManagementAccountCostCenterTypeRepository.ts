import { AppDataSource } from '../database/typeorm.config.js';
import { ManagementAccountCostCenterTypeEntity } from '../database/entities/ManagementAccountCostCenterTypeEntity.js';
import type { IManagementAccountCostCenterTypeRepository } from '../../domain/repositories/IManagementAccountCostCenterTypeRepository.js';

export class ManagementAccountCostCenterTypeRepository
  implements IManagementAccountCostCenterTypeRepository
{
  private repository = AppDataSource.getRepository(ManagementAccountCostCenterTypeEntity);

  async linkAccountToType(accountId: string, costCenterType: string): Promise<void> {
    const existing = await this.repository.findOne({
      where: { managementAccountId: accountId, costCenterType },
    });
    if (existing) return;

    const link = this.repository.create({
      managementAccountId: accountId,
      costCenterType,
    });
    await this.repository.save(link);
  }

  async unlinkAccountFromType(accountId: string, costCenterType: string): Promise<void> {
    await this.repository.delete({ managementAccountId: accountId, costCenterType });
  }

  async getTypesForAccount(accountId: string): Promise<string[]> {
    const links = await this.repository.find({
      where: { managementAccountId: accountId },
    });
    return links.map((l) => l.costCenterType);
  }

  async getAccountIdsForType(costCenterType: string, tenantId: string): Promise<string[]> {
    const links = await this.repository
      .createQueryBuilder('link')
      .innerJoin('link.managementAccount', 'account')
      .where('link.cost_center_type = :type', { type: costCenterType })
      .andWhere('account.tenantId = :tenantId', { tenantId })
      .andWhere('account.isActive = true')
      .select('link.management_account_id', 'accountId')
      .getRawMany<{ accountId: string }>();

    return links.map((row) => row.accountId);
  }
}

