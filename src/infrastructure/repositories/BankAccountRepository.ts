import { Repository } from 'typeorm';
import type { IBankAccountRepository } from '../../domain/repositories/IBankAccountRepository.js';
import { BankAccount } from '../../domain/entities/BankAccount.js';
import { BankAccountEntity } from '../database/entities/BankAccountEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class BankAccountRepository implements IBankAccountRepository {
  private repo: Repository<BankAccountEntity>;

  constructor() {
    this.repo = AppDataSource.getRepository(BankAccountEntity);
  }

  async findAll(tenantId: string): Promise<BankAccount[]> {
    const entities = await this.repo.find({
      where: { tenantId },
      order: { name: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<BankAccount | null> {
    const entity = await this.repo.findOne({
      where: { id, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string, tenantId: string): Promise<BankAccount | null> {
    const entity = await this.repo.findOne({
      where: { name, tenantId },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async save(account: BankAccount): Promise<BankAccount> {
    const entity = new BankAccountEntity();
    (entity as any).id = account.getId();
    entity.tenantId = account.getTenantId();
    entity.name = account.getName();
    entity.bankName = account.getBankName();
    entity.agency = account.getAgency();
    entity.accountNumber = account.getAccountNumber();
    entity.isActive = account.getIsActive();
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.repo.delete({ id, tenantId });
  }

  private toDomain(entity: BankAccountEntity): BankAccount {
    return new BankAccount({
      id: entity.id,
      tenantId: entity.tenantId,
      name: entity.name,
      bankName: entity.bankName,
      agency: entity.agency,
      accountNumber: entity.accountNumber,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
