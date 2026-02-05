import { Repository } from 'typeorm';
import type { IInvoiceRepository } from '../../domain/repositories/IInvoiceRepository.js';
import { Invoice } from '../../domain/entities/Invoice.js';
import { InvoiceItem } from '../../domain/entities/InvoiceItem.js';
import { InvoiceFinancial } from '../../domain/entities/InvoiceFinancial.js';
import { InvoiceFinancialStatus } from '../../domain/enums/InvoiceFinancialStatus.js';
import { ItemType } from '../../domain/enums/ItemType.js';
import { InvoiceType } from '../../domain/enums/InvoiceType.js';
import { InvoiceEntity } from '../database/entities/InvoiceEntity.js';
import { InvoiceItemEntity } from '../database/entities/InvoiceItemEntity.js';
import { InvoiceFinancialEntity } from '../database/entities/InvoiceFinancialEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class InvoiceRepository implements IInvoiceRepository {
  private invoiceRepo: Repository<InvoiceEntity>;
  private itemRepo: Repository<InvoiceItemEntity>;
  private financialRepo: Repository<InvoiceFinancialEntity>;

  constructor() {
    this.invoiceRepo = AppDataSource.getRepository(InvoiceEntity);
    this.itemRepo = AppDataSource.getRepository(InvoiceItemEntity);
    this.financialRepo = AppDataSource.getRepository(InvoiceFinancialEntity);
  }

  async findAll(tenantId: string): Promise<Invoice[]> {
    const entities = await this.invoiceRepo.find({
      where: { tenantId },
      relations: ['items', 'financials', 'documentType', 'supplier', 'supplier.person', 'emitterSupplier', 'emitterSupplier.person', 'emitterParty', 'recipientClient', 'recipientClient.person', 'recipientParty'],
      order: { issueDate: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Invoice | null> {
    const entity = await this.invoiceRepo.findOne({
      where: { id, tenantId },
      relations: ['items', 'financials', 'documentType', 'supplier', 'supplier.person', 'emitterSupplier', 'emitterSupplier.person', 'emitterParty', 'recipientClient', 'recipientClient.person', 'recipientParty'],
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async save(invoice: Invoice, tenantId: string): Promise<Invoice> {
    const isNew = !(await this.invoiceRepo.findOne({ where: { id: invoice.getId(), tenantId } }));

    const invEntity = new InvoiceEntity();
    invEntity.id = invoice.getId();
    invEntity.tenantId = tenantId;
    invEntity.number = invoice.getNumber();
    invEntity.series = invoice.getSeries() ?? null;
    invEntity.issueDate = invoice.getIssueDate().toISOString().slice(0, 10);
    invEntity.emitterSupplierId = invoice.getEmitterSupplierId();
    invEntity.emitterPartyId = invoice.getEmitterPartyId();
    invEntity.recipientClientId = invoice.getRecipientClientId();
    invEntity.recipientPartyId = invoice.getRecipientPartyId();
    invEntity.documentTypeId = invoice.getDocumentTypeId() ?? null;
    invEntity.type = invoice.getType();
    invEntity.notes = invoice.getNotes() ?? null;

    await this.invoiceRepo.save(invEntity);

    if (!isNew) {
      await this.itemRepo.delete({ invoiceId: invoice.getId() });
      await this.financialRepo.delete({ invoiceId: invoice.getId() });
    }

    for (const line of invoice.getItems()) {
      const itemEnt = new InvoiceItemEntity();
      itemEnt.id = line.getId();
      itemEnt.invoiceId = invoice.getId();
      itemEnt.itemId = line.getItemId();
      itemEnt.description = line.getDescription() ?? null;
      itemEnt.itemType = line.getItemType();
      itemEnt.quantity = line.getQuantity();
      itemEnt.unit = line.getUnit();
      itemEnt.unitPrice = line.getUnitPrice();
      itemEnt.lineOrder = line.getLineOrder();
      itemEnt.costCenterId = line.getCostCenterId();
      itemEnt.managementAccountId = line.getManagementAccountId();
      itemEnt.seasonId = line.getSeasonId();
      itemEnt.goesToStock = line.getGoesToStock();
      await this.itemRepo.save(itemEnt);
    }

    for (const fin of invoice.getFinancials()) {
      const finEnt = new InvoiceFinancialEntity();
      finEnt.id = fin.getId();
      finEnt.invoiceId = invoice.getId();
      finEnt.dueDate = fin.getDueDate().toISOString().slice(0, 10);
      finEnt.amount = fin.getAmount();
      finEnt.paidAt = fin.getPaidAt() ?? null;
      finEnt.clearedAt = fin.getClearedAt() ?? null;
      finEnt.penalty = fin.getPenalty();
      finEnt.interest = fin.getInterest();
      finEnt.bankAccountId = fin.getBankAccountId();
      finEnt.invoiceFinancialsTypeId = fin.getInvoiceFinancialsTypeId();
      finEnt.status = fin.getStatus();
      await this.financialRepo.save(finEnt);
    }

    return (await this.findById(invoice.getId(), tenantId))!;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.itemRepo.delete({ invoiceId: id });
    await this.financialRepo.delete({ invoiceId: id });
    await this.invoiceRepo.delete({ id, tenantId });
  }

  async existsByNumber(number: string, tenantId: string, excludeId?: string): Promise<boolean> {
    const qb = this.invoiceRepo
      .createQueryBuilder('inv')
      .where('inv.tenantId = :tenantId', { tenantId })
      .andWhere('inv.number = :number', { number });
    if (excludeId) {
      qb.andWhere('inv.id != :excludeId', { excludeId });
    }
    const count = await qb.getCount();
    return count > 0;
  }

  private toDomain(entity: InvoiceEntity): Invoice {
    const items = (entity.items ?? []).map((i) => this.itemToDomain(i));
    const financials = (entity.financials ?? []).map((f) => this.financialToDomain(f));

    const type = entity.type as InvoiceType;
    const emitterSupplierId = entity.emitterSupplierId ?? (type === 'DESPESA' ? entity.supplierId : null);
    const emitterPartyId = entity.emitterPartyId ?? (type === 'RECEITA' ? null : null);
    const recipientClientId = entity.recipientClientId ?? null;
    const recipientPartyId = entity.recipientPartyId ?? null;

    const invoice = new Invoice({
      id: entity.id,
      tenantId: entity.tenantId,
      number: entity.number,
      series: entity.series ?? undefined,
      issueDate: new Date(entity.issueDate + 'T00:00:00'),
      emitterSupplierId: emitterSupplierId ?? null,
      emitterPartyId: emitterPartyId ?? null,
      recipientClientId: recipientClientId ?? null,
      recipientPartyId: recipientPartyId ?? null,
      documentTypeId: entity.documentTypeId ?? undefined,
      notes: entity.notes ?? undefined,
      type,
      items,
      financials,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    if (entity.documentType) {
      (invoice as any)._documentType = {
        id: entity.documentType.id,
        name: entity.documentType.name,
        group: entity.documentType.group,
        hasAccessKey: entity.documentType.hasAccessKey,
      };
    }

    if (type === 'RECEITA' && entity.emitterParty) {
      (invoice as any)._emitter = {
        type: 'PARTY',
        id: entity.emitterParty.id,
        nomeEstabelecimento: entity.emitterParty.nomeEstabelecimento ?? entity.emitterParty.nomeResponsavel ?? '',
        numeroIe: entity.emitterParty.numeroIe,
        cpfCnpj: entity.emitterParty.cpfCnpj ?? null,
      };
    } else if (type === 'DESPESA' && entity.emitterSupplier?.person) {
      const p = entity.emitterSupplier.person;
      (invoice as any)._emitter = {
        type: 'SUPPLIER',
        id: entity.emitterSupplier.id,
        nome: p.nome,
        cpfCnpj: p.cpfCnpj ?? null,
      };
    } else if (type === 'DESPESA' && entity.supplier?.person) {
      const p = entity.supplier.person;
      (invoice as any)._emitter = {
        type: 'SUPPLIER',
        id: entity.supplier.id,
        nome: p.nome,
        cpfCnpj: p.cpfCnpj ?? null,
      };
    }

    if (type === 'RECEITA' && entity.recipientClient?.person) {
      const p = entity.recipientClient.person;
      (invoice as any)._recipient = {
        type: 'CLIENT',
        id: entity.recipientClient.id,
        nome: p.nome,
        cpfCnpj: p.cpfCnpj ?? null,
      };
    } else if (type === 'DESPESA' && entity.recipientParty) {
      (invoice as any)._recipient = {
        type: 'PARTY',
        id: entity.recipientParty.id,
        nomeEstabelecimento: entity.recipientParty.nomeEstabelecimento ?? entity.recipientParty.nomeResponsavel ?? '',
        numeroIe: entity.recipientParty.numeroIe,
        cpfCnpj: entity.recipientParty.cpfCnpj ?? null,
      };
    }

    return invoice;
  }

  private itemToDomain(entity: InvoiceItemEntity): InvoiceItem {
    return new InvoiceItem({
      id: entity.id,
      invoiceId: entity.invoiceId,
      itemId: entity.itemId,
      description: entity.description ?? undefined,
      itemType: entity.itemType as ItemType,
      quantity: Number(entity.quantity),
      unit: entity.unit,
      unitPrice: Number(entity.unitPrice),
      lineOrder: entity.lineOrder,
      costCenterId: entity.costCenterId ?? null,
      managementAccountId: entity.managementAccountId ?? null,
      seasonId: entity.seasonId ?? null,
      goesToStock: entity.goesToStock ?? false,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private financialToDomain(entity: InvoiceFinancialEntity): InvoiceFinancial {
    return new InvoiceFinancial({
      id: entity.id,
      invoiceId: entity.invoiceId,
      dueDate: new Date(entity.dueDate + 'T00:00:00'),
      amount: Number(entity.amount),
      paidAt: entity.paidAt ?? undefined,
      clearedAt: entity.clearedAt ?? undefined,
      penalty: Number(entity.penalty ?? 0),
      interest: Number(entity.interest ?? 0),
      bankAccountId: entity.bankAccountId ?? null,
      invoiceFinancialsTypeId: entity.invoiceFinancialsTypeId ?? null,
      status: entity.status as InvoiceFinancialStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
