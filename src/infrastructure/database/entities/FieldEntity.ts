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
import { CostCenterEntity } from './CostCenterEntity.js';
import { WorkLocationTypeEntity } from './WorkLocationTypeEntity.js';

@Entity('fields')
export class FieldEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'work_location_type_id', nullable: true })
  workLocationTypeId!: string | null;

  @Column({ type: 'varchar', length: 50 })
  code!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  /** @deprecated Use work_location_type_id. Kept for migration. */
  @Column({ type: 'varchar', length: 30, nullable: true })
  type!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'area_hectares',
    nullable: true,
  })
  areaHectares!: string | null;

  @Column({ type: 'uuid', name: 'cost_center_id', nullable: true })
  costCenterId!: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => CostCenterEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter!: CostCenterEntity | null;

  @ManyToOne(() => WorkLocationTypeEntity, { onDelete: 'RESTRICT', nullable: true })
  @JoinColumn({ name: 'work_location_type_id' })
  workLocationType!: WorkLocationTypeEntity | null;
}

