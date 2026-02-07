import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';

@Entity('activity_types')
export class ActivityTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Nullable = tipo de sistema (criado por super-admin, disponível para todas as organizações). */
  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  @Index()
  tenantId!: string | null;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity | null;
}
