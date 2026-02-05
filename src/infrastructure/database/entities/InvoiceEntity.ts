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
import { SupplierEntity } from './SupplierEntity.js';
import { ClientEntity } from './ClientEntity.js';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';
import { InvoiceItemEntity } from './InvoiceItemEntity.js';
import { InvoiceFinancialEntity } from './InvoiceFinancialEntity.js';
import { DocumentTypeEntity } from './DocumentTypeEntity.js';

@Entity('invoices')
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 100, name: 'number' })
  number!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  series!: string | null;

  @Column({ type: 'date', name: 'issue_date' })
  issueDate!: string;

  /** Legado: usado apenas para migração; preferir emitter_supplier_id / emitter_party_id */
  @Column({ type: 'uuid', name: 'supplier_id', nullable: true })
  supplierId!: string | null;

  @Column({ type: 'uuid', name: 'emitter_supplier_id', nullable: true })
  emitterSupplierId!: string | null;

  @Column({ type: 'uuid', name: 'emitter_party_id', nullable: true })
  emitterPartyId!: string | null;

  @Column({ type: 'uuid', name: 'recipient_client_id', nullable: true })
  recipientClientId!: string | null;

  @Column({ type: 'uuid', name: 'recipient_party_id', nullable: true })
  recipientPartyId!: string | null;

  @Column({ type: 'uuid', name: 'document_type_id', nullable: true })
  documentTypeId!: string | null;

  @Column({ type: 'varchar', length: 20, default: 'DESPESA' })
  type!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => SupplierEntity, { nullable: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierEntity | null;

  @ManyToOne(() => SupplierEntity, { nullable: true })
  @JoinColumn({ name: 'emitter_supplier_id' })
  emitterSupplier!: SupplierEntity | null;

  @ManyToOne(() => StateRegistrationEntity, { nullable: true })
  @JoinColumn({ name: 'emitter_party_id' })
  emitterParty!: StateRegistrationEntity | null;

  @ManyToOne(() => ClientEntity, { nullable: true })
  @JoinColumn({ name: 'recipient_client_id' })
  recipientClient!: ClientEntity | null;

  @ManyToOne(() => StateRegistrationEntity, { nullable: true })
  @JoinColumn({ name: 'recipient_party_id' })
  recipientParty!: StateRegistrationEntity | null;

  @ManyToOne(() => DocumentTypeEntity, { nullable: true })
  @JoinColumn({ name: 'document_type_id' })
  documentType!: DocumentTypeEntity | null;

  @OneToMany(() => InvoiceItemEntity, (item) => item.invoice, { cascade: true })
  items!: InvoiceItemEntity[];

  @OneToMany(() => InvoiceFinancialEntity, (fin) => fin.invoice, { cascade: true })
  financials!: InvoiceFinancialEntity[];
}
