import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { InvoiceShipmentEntity } from './InvoiceShipmentEntity.js';
import { InvoiceItemEntity } from './InvoiceItemEntity.js';

@Entity('invoice_shipment_items')
export class InvoiceShipmentItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'shipment_id' })
  @Index()
  shipmentId!: string;

  @Column({ type: 'uuid', name: 'invoice_item_id' })
  @Index()
  invoiceItemId!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, name: 'quantity_shipped' })
  quantityShipped!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => InvoiceShipmentEntity, (shipment) => shipment.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shipment_id' })
  shipment!: InvoiceShipmentEntity;

  @ManyToOne(() => InvoiceItemEntity)
  @JoinColumn({ name: 'invoice_item_id' })
  invoiceItem!: InvoiceItemEntity;
}
