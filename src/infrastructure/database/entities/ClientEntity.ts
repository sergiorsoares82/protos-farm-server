import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, ManyToOne, Index } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';

@Entity('clients')
export class ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index() // Important for query performance
  tenantId!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  personId!: string;

  @Column({ type: 'varchar', length: 255, name: 'company_name', nullable: true })
  companyName!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'tax_id', nullable: true })
  taxId!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'preferred_payment_method', nullable: true })
  preferredPaymentMethod!: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, name: 'credit_limit', nullable: true })
  creditLimit!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne('PersonEntity', (person: any) => person.client, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: any;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;
}
