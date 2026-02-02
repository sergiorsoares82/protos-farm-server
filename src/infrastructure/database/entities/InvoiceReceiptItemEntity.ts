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
import type { InvoiceReceiptEntity } from './InvoiceReceiptEntity.js';
import { InvoiceItemEntity } from './InvoiceItemEntity.js';
import { getEntity } from './entityRegistry.js';

@Entity('invoice_receipt_items')
export class InvoiceReceiptItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'receipt_id' })
  @Index()
  receiptId!: string;

  @Column({ type: 'uuid', name: 'invoice_item_id' })
  @Index()
  invoiceItemId!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, name: 'quantity_received' })
  quantityReceived!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => getEntity<typeof InvoiceReceiptEntity>('InvoiceReceiptEntity'), (receipt) => receipt.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receipt_id' })
  receipt!: InvoiceReceiptEntity;

  @ManyToOne(() => InvoiceItemEntity)
  @JoinColumn({ name: 'invoice_item_id' })
  invoiceItem!: InvoiceItemEntity;
}
