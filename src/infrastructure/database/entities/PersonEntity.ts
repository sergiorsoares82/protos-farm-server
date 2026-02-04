import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';

@Entity('persons')
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index() // Important for query performance
  tenantId!: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'nome' })
  nome!: string;

  @Column({ type: 'varchar', length: 20, name: 'person_type' })
  personType!: string;

  @Column({ type: 'varchar', length: 50, name: 'cpf_cnpj', nullable: true })
  cpfCnpj!: string | null;

  // E-mail opcional: permite proprietários sem e-mail
  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations to role entities
  @OneToOne('ClientEntity', (client: any) => client.person, { eager: false, cascade: true })
  client?: any;

  @OneToOne('SupplierEntity', (supplier: any) => supplier.person, { eager: false, cascade: true })
  supplier?: any;

  @OneToOne('WorkerEntity', (worker: any) => worker.person, { eager: false, cascade: true })
  worker?: any;

  @OneToMany('FarmOwnerEntity', (farmOwner: any) => farmOwner.person, { eager: false, cascade: true })
  farmOwners?: any[];

  @OneToOne('UserEntity', (user: any) => user.person, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: any;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;
}
