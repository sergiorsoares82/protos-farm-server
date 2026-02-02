import { In, Repository } from 'typeorm';
import type { IInvoiceShipmentRepository } from '../../domain/repositories/IInvoiceShipmentRepository.js';
import { InvoiceShipment } from '../../domain/entities/InvoiceShipment.js';
import { InvoiceShipmentItem } from '../../domain/entities/InvoiceShipmentItem.js';
import { InvoiceShipmentEntity } from '../database/entities/InvoiceShipmentEntity.js';
import { InvoiceShipmentItemEntity } from '../database/entities/InvoiceShipmentItemEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class InvoiceShipmentRepository implements IInvoiceShipmentRepository {
  private shipmentRepo: Repository<InvoiceShipmentEntity>;
  private itemRepo: Repository<InvoiceShipmentItemEntity>;

  constructor() {
    this.shipmentRepo = AppDataSource.getRepository(InvoiceShipmentEntity);
    this.itemRepo = AppDataSource.getRepository(InvoiceShipmentItemEntity);
  }

  async save(shipment: InvoiceShipment, tenantId: string): Promise<InvoiceShipment> {
    const isNew = !(await this.shipmentRepo.findOne({ where: { id: shipment.getId(), tenantId } }));

    const ent = new InvoiceShipmentEntity();
    ent.id = shipment.getId();
    ent.tenantId = tenantId;
    ent.invoiceId = shipment.getInvoiceId();
    ent.shipmentDate = shipment.getShipmentDate().toISOString().slice(0, 10);
    ent.notes = shipment.getNotes();

    await this.shipmentRepo.save(ent);

    if (!isNew) {
      await this.itemRepo.delete({ shipmentId: shipment.getId() });
    }

    for (const line of shipment.getItems()) {
      const itemEnt = new InvoiceShipmentItemEntity();
      itemEnt.id = line.getId();
      itemEnt.shipmentId = shipment.getId();
      itemEnt.invoiceItemId = line.getInvoiceItemId();
      itemEnt.quantityShipped = line.getQuantityShipped();
      await this.itemRepo.save(itemEnt);
    }

    return (await this.findById(shipment.getId(), tenantId))!;
  }

  async findById(id: string, tenantId: string): Promise<InvoiceShipment | null> {
    const entity = await this.shipmentRepo.findOne({
      where: { id, tenantId },
      relations: ['items'],
    });
    if (!entity) return null;
    return this.toDomain(entity);
  }

  async findByInvoiceId(invoiceId: string, tenantId: string): Promise<InvoiceShipment[]> {
    const entities = await this.shipmentRepo.find({
      where: { invoiceId, tenantId },
      relations: ['items'],
      order: { shipmentDate: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByInvoiceIds(tenantId: string, invoiceIds: string[]): Promise<InvoiceShipment[]> {
    if (invoiceIds.length === 0) return [];
    const entities = await this.shipmentRepo.find({
      where: { tenantId, invoiceId: In(invoiceIds) },
      relations: ['items'],
      order: { shipmentDate: 'ASC', createdAt: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.itemRepo.delete({ shipmentId: id });
    await this.shipmentRepo.delete({ id, tenantId });
  }

  private toDomain(entity: InvoiceShipmentEntity): InvoiceShipment {
    const items = (entity.items ?? []).map((i) => this.itemToDomain(i));
    return new InvoiceShipment({
      id: entity.id,
      tenantId: entity.tenantId,
      invoiceId: entity.invoiceId,
      shipmentDate: new Date(entity.shipmentDate + 'T00:00:00'),
      notes: entity.notes ?? null,
      items,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private itemToDomain(entity: InvoiceShipmentItemEntity): InvoiceShipmentItem {
    return new InvoiceShipmentItem({
      id: entity.id,
      shipmentId: entity.shipmentId,
      invoiceItemId: entity.invoiceItemId,
      quantityShipped: Number(entity.quantityShipped),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
