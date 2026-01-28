import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn, Index } from 'typeorm';
import { UserEntity } from './UserEntity.js';
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

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName!: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

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

  @OneToOne('FarmOwnerEntity', (farmOwner: any) => farmOwner.person, { eager: false, cascade: true })
  farmOwner?: any;

  @OneToOne(() => UserEntity, user => user.person, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;
}
