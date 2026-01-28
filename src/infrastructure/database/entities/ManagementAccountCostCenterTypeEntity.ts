import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ManagementAccountEntity } from './ManagementAccountEntity.js';

@Entity('management_account_cost_center_types')
@Unique(['managementAccountId', 'costCenterType'])
export class ManagementAccountCostCenterTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'management_account_id' })
  managementAccountId!: string;

  @Column({ type: 'varchar', length: 50, name: 'cost_center_type' })
  costCenterType!: string; // matches CostCenterType enum values

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @CreateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => ManagementAccountEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'management_account_id' })
  managementAccount!: ManagementAccountEntity;
}

