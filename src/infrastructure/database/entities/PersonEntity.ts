import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from './UserEntity.js';
import type { ClientEntity } from './ClientEntity.js';
import type { SupplierEntity } from './SupplierEntity.js';
import type { WorkerEntity } from './WorkerEntity.js';
import type { FarmOwnerEntity } from './FarmOwnerEntity.js';

@Entity('persons')
export class PersonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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
  client?: ClientEntity;

  @OneToOne('SupplierEntity', (supplier: any) => supplier.person, { eager: false, cascade: true })
  supplier?: SupplierEntity;

  @OneToOne('WorkerEntity', (worker: any) => worker.person, { eager: false, cascade: true })
  worker?: WorkerEntity;

  @OneToOne('FarmOwnerEntity', (farmOwner: any) => farmOwner.person, { eager: false, cascade: true })
  farmOwner?: FarmOwnerEntity;

  @ManyToOne(() => UserEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity;
}
