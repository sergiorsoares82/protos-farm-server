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
      relations: ['items', 'financials', 'documentType'],
      order: { issueDate: 'DESC', createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findById(id: string, tenantId: string): Promise<Invoice | null> {
    const entity = await this.invoiceRepo.findOne({
      where: { id, tenantId },
      relations: ['items', 'financials', 'documentType'],
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
    invEntity.supplierId = invoice.getSupplierId();
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
      await this.itemRepo.save(itemEnt);
    }

    for (const fin of invoice.getFinancials()) {
      const finEnt = new InvoiceFinancialEntity();
      finEnt.id = fin.getId();
      finEnt.invoiceId = invoice.getId();
      finEnt.dueDate = fin.getDueDate().toISOString().slice(0, 10);
      finEnt.amount = fin.getAmount();
      finEnt.paidAt = fin.getPaidAt() ?? null;
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

    const invoice = new Invoice({
      id: entity.id,
      tenantId: entity.tenantId,
      number: entity.number,
      series: entity.series ?? undefined,
      issueDate: new Date(entity.issueDate + 'T00:00:00'),
      supplierId: entity.supplierId,
      documentTypeId: entity.documentTypeId ?? undefined,
      notes: entity.notes ?? undefined,
      type: entity.type as InvoiceType,
      items,
      financials,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });

    // Store documentType for JSON serialization if available
    if (entity.documentType) {
      (invoice as any)._documentType = {
        id: entity.documentType.id,
        name: entity.documentType.name,
        group: entity.documentType.group,
        hasAccessKey: entity.documentType.hasAccessKey,
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
      status: entity.status as InvoiceFinancialStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
