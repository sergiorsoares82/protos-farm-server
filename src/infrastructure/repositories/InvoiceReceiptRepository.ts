import { In, Repository } from 'typeorm';
import type { IInvoiceReceiptRepository } from '../../domain/repositories/IInvoiceReceiptRepository.js';
import { InvoiceReceipt } from '../../domain/entities/InvoiceReceipt.js';
import { InvoiceReceiptItem } from '../../domain/entities/InvoiceReceiptItem.js';
import { InvoiceReceiptEntity } from '../database/entities/InvoiceReceiptEntity.js';
import { InvoiceReceiptItemEntity } from '../database/entities/InvoiceReceiptItemEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class InvoiceReceiptRepository implements IInvoiceReceiptRepository {
  private receiptRepo: Repository<InvoiceReceiptEntity>;
  private itemRepo: Repository<InvoiceReceiptItemEntity>;

  constructor() {
    this.receiptRepo = AppDataSource.getRepository(InvoiceReceiptEntity);
    this.itemRepo = AppDataSource.getRepository(InvoiceReceiptItemEntity);
  }

  async save(receipt: InvoiceReceipt, tenantId: string): Promise<InvoiceReceipt> {
    const isNew = !(await this.receiptRepo.findOne({ where: { id: receipt.getId(), tenantId } }));

    const recEntity = new InvoiceReceiptEntity();
    recEntity.id = receipt.getId();
    recEntity.tenantId = tenantId;
    recEntity.invoiceId = receipt.getInvoiceId();
    recEntity.receiptDate = receipt.getReceiptDate().toISOString().slice(0, 10);
    recEntity.notes = receipt.getNotes();

    await this.receiptRepo.save(recEntity);

    if (!isNew) {
      await this.itemRepo.delete({ receiptId: receipt.getId() });
    }

    for (const line of receipt.getItems()) {
      const itemEnt = new InvoiceReceiptItemEntity();
      itemEnt.id = line.getId();
      itemEnt.receiptId = receipt.getId();
      itemEnt.invoiceItemId = line.getInvoiceItemId();
      itemEnt.quantityReceived = line.getQuantityReceived();
      await this.itemRepo.save(itemEnt);
    }

    return (await this.findById(receipt.getId(), tenantId))!;
  }

  async findById(id: string, tenantId: string): Promise<InvoiceReceipt | null> {
    const entity = await this.receiptRepo.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByInvoiceId(invoiceId: string, tenantId: string): Promise<InvoiceReceipt[]> {
    const entities = await this.receiptRepo.find({
      where: { invoiceId, tenantId },
      relations: ['items'],
      order: { receiptDate: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByInvoiceIds(tenantId: string, invoiceIds: string[]): Promise<InvoiceReceipt[]> {
    if (invoiceIds.length === 0) return [];
    const entities = await this.receiptRepo.find({
      where: { tenantId, invoiceId: In(invoiceIds) },
      relations: ['items'],
      order: { receiptDate: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.itemRepo.delete({ receiptId: id });
    await this.receiptRepo.delete({ id, tenantId });
  }

  private toDomain(entity: InvoiceReceiptEntity): InvoiceReceipt {
    const items = (entity.items ?? []).map((i) => this.itemToDomain(i));
    return new InvoiceReceipt({
      id: entity.id,
      tenantId: entity.tenantId,
      invoiceId: entity.invoiceId,
      receiptDate: new Date(entity.receiptDate + 'T00:00:00'),
      notes: entity.notes ?? null,
      items,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private itemToDomain(entity: InvoiceReceiptItemEntity): InvoiceReceiptItem {
    return new InvoiceReceiptItem({
      id: entity.id,
      receiptId: entity.receiptId,
      invoiceItemId: entity.invoiceItemId,
      quantityReceived: Number(entity.quantityReceived),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
