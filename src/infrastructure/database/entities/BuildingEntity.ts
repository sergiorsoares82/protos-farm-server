import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { CostCenterEntity } from './CostCenterEntity.js';

@Entity('buildings')
export class BuildingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'cost_center_id', unique: true })
  costCenterId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'area_m2' })
  areaM2?: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'land_registry' })
  landRegistry?: string | null;

  @Column({ type: 'text', nullable: true, name: 'location_details' })
  locationDetails?: string | null;

  @Column({ type: 'date', nullable: true, name: 'construction_date' })
  constructionDate?: Date | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @OneToOne(() => CostCenterEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter!: CostCenterEntity;
}
