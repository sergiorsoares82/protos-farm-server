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
import type { BankAccountEntity } from './BankAccountEntity.js';
import type { InvoiceFinancialsTypeEntity } from './InvoiceFinancialsTypeEntity.js';

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

  @Column({ type: 'timestamp', name: 'cleared_at', nullable: true })
  clearedAt!: Date | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  penalty!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  interest!: number;

  @Column({ type: 'varchar', length: 20, default: 'PENDING' })
  status!: string;

  @Column({ type: 'uuid', name: 'bank_account_id', nullable: true })
  bankAccountId!: string | null;

  @Column({ type: 'uuid', name: 'invoice_financials_type_id', nullable: true })
  invoiceFinancialsTypeId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('InvoiceEntity', 'financials', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice!: InvoiceEntity;

  @ManyToOne('BankAccountEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount!: BankAccountEntity | null;

  @ManyToOne('InvoiceFinancialsTypeEntity', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'invoice_financials_type_id' })
  invoiceFinancialsType!: InvoiceFinancialsTypeEntity | null;
}
