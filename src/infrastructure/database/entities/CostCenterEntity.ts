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
import { OrganizationEntity } from './OrganizationEntity.js';
import { CostCenterCategoryEntity } from './CostCenterCategoryEntity.js';
import { AssetEntity } from './AssetEntity.js';
import { ActivityTypeEntity } from './ActivityTypeEntity.js';

@Entity('cost_centers')
export class CostCenterEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    @Index()
    tenantId!: string;

    @Column({ type: 'varchar', length: 20 })
    code!: string; // Sigla

    @Column({ type: 'varchar', length: 200 })
    description!: string;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // 'PRODUCTIVE', 'ADMINISTRATIVE', 'SHARED'

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => OrganizationEntity)
    @JoinColumn({ name: 'tenant_id' })
    tenant!: OrganizationEntity;

  @ManyToOne(() => CostCenterCategoryEntity, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category?: CostCenterCategoryEntity | null;

  @ManyToOne(() => AssetEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'asset_id' })
  asset?: AssetEntity | null;

  @ManyToOne(() => ActivityTypeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'activity_type_id' })
  activityType?: ActivityTypeEntity | null;
}
