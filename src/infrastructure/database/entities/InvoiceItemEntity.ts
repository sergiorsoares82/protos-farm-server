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
import type { InvoiceEntity } from './InvoiceEntity.js';
import { ItemEntity } from './ItemEntity.js';

@Entity('invoice_items')
export class InvoiceItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'invoice_id' })
  @Index()
  invoiceId!: string;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'item_type' })
  itemType!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  quantity!: number;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'unit_price' })
  unitPrice!: number;

  @Column({ type: 'int', name: 'line_order', default: 0 })
  lineOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('InvoiceEntity', 'items', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: InvoiceEntity;

  @ManyToOne(() => ItemEntity)
  @JoinColumn({ name: 'item_id' })
  item!: ItemEntity;
}
