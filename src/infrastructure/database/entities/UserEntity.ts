import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { UserRole } from '../../../domain/enums/UserRole.js';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index() // Important for query performance
  tenantId!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  @Index() // Important for role-based queries
  role!: UserRole;

  @Column({ type: 'uuid', name: 'person_id', nullable: true })
  personId?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @OneToOne('PersonEntity', (person: any) => person.user, { nullable: true })
  @JoinColumn({ name: 'person_id' })
  person?: any;
}
