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
import { InvoiceEntity } from './InvoiceEntity.js';

@Entity('invoice_financials')
export class InvoiceFinancialEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'invoice_id' })
  @Index()
  invoiceId!: string;

  @Column({ type: 'date', name: 'due_date' })
  dueDate!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ type: 'timestamp', name: 'paid_at', nullable: true })
  paidAt!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => InvoiceEntity, (inv) => inv.financials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: InvoiceEntity;
}
