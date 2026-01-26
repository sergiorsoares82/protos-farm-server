import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import type { PersonEntity } from './PersonEntity.js';

@Entity('suppliers')
export class SupplierEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  personId!: string;

  @Column({ type: 'varchar', length: 255, name: 'company_name' })
  companyName!: string;

  @Column({ type: 'varchar', length: 50, name: 'tax_id' })
  taxId!: string;

  @Column({ type: 'text', name: 'supply_categories', nullable: true })
  supplyCategories!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'payment_terms', nullable: true })
  paymentTerms!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne('PersonEntity', (person: any) => person.supplier, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;
}
