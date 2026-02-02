import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { InvoiceEntity } from './InvoiceEntity.js';
import { InvoiceReceiptItemEntity } from './InvoiceReceiptItemEntity.js';

@Entity('invoice_receipts')
export class InvoiceReceiptEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'invoice_id' })
  @Index()
  invoiceId!: string;

  @Column({ type: 'date', name: 'receipt_date' })
  receiptDate!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => InvoiceEntity)
  @JoinColumn({ name: 'invoice_id' })
  invoice!: InvoiceEntity;

  @OneToMany(() => InvoiceReceiptItemEntity, (item) => item.receipt, { cascade: true })
  items!: InvoiceReceiptItemEntity[];
}
