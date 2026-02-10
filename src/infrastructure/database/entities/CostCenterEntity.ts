import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { CostCenterCategoryEntity } from './CostCenterCategoryEntity.js';
import { CostCenterKindCategoryEntity } from './CostCenterKindCategoryEntity.js';
import { AssetEntity } from './AssetEntity.js';
import { ActivityTypeEntity } from './ActivityTypeEntity.js';
import { MachineEntity } from './MachineEntity.js';
import { BuildingEntity } from './BuildingEntity.js';
import { FieldEntity } from './FieldEntity.js';

@Entity('cost_centers')
export class CostCenterEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', name: 'tenant_id' })
    @Index()
    tenantId!: string;

    @Column({ type: 'varchar', length: 20 })
    code!: string; // Sigla única

    @Column({ type: 'varchar', length: 200, nullable: true })
    name?: string | null; // Nome descritivo

    @Column({ type: 'varchar', length: 200 })
    description!: string;

    @Column({ type: 'varchar', length: 50, default: 'GENERAL' })
    kind!: string; // 'MACHINE', 'BUILDING', 'GENERAL' (legacy; prefer kindCategoryId)

    @Column({ type: 'uuid', nullable: true, name: 'kind_category_id' })
    kindCategoryId?: string | null;

    @Column({ type: 'varchar', length: 50 })
    type!: string; // 'PRODUCTIVE', 'ADMINISTRATIVE', 'SHARED'

    @Column({ type: 'boolean', default: false, name: 'has_technical_data' })
    hasTechnicalData!: boolean;

    // Dados patrimoniais (para todos os tipos)
    @Column({ type: 'date', nullable: true, name: 'acquisition_date' })
    acquisitionDate?: Date | null;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'acquisition_value' })
    acquisitionValue?: number | null;

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'current_value' })
    currentValue?: number | null;

    @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
    @Index()
    parentId?: string | null;

    @Column({ type: 'uuid', nullable: true, name: 'related_field_id' })
    @Index()
    relatedFieldId?: string | null;

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

  @ManyToOne(() => CostCenterKindCategoryEntity, { nullable: true })
  @JoinColumn({ name: 'kind_category_id' })
  kindCategory?: CostCenterKindCategoryEntity | null;

  @ManyToOne(() => CostCenterEntity, (cc) => cc.children, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: CostCenterEntity | null;

  @OneToMany(() => CostCenterEntity, (cc) => cc.parent)
  children?: CostCenterEntity[];

  @ManyToOne(() => FieldEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'related_field_id' })
  relatedField?: FieldEntity | null;

  @ManyToOne(() => AssetEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'asset_id' })
  asset?: AssetEntity | null;

  @ManyToOne(() => ActivityTypeEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'activity_type_id' })
  activityType?: ActivityTypeEntity | null;

  // Relacionamentos reversos (1:1 opcionais)
  @OneToOne(() => MachineEntity, machine => machine.costCenter, { nullable: true })
  machine?: MachineEntity | null;

  @OneToOne(() => BuildingEntity, building => building.costCenter, { nullable: true })
  building?: BuildingEntity | null;
}
