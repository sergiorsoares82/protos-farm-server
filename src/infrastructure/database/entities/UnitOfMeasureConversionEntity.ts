import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { UnitOfMeasureEntity } from './UnitOfMeasureEntity.js';

@Entity('unit_of_measure_conversions')
@Unique('UQ_conversion_tenant_from_to', ['tenantId', 'fromUnitId', 'toUnitId'])
export class UnitOfMeasureConversionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Nullable = conversão de sistema, disponível para todas as organizações */
  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  @Index()
  tenantId!: string | null;

  @Column({ type: 'uuid', name: 'from_unit_id' })
  fromUnitId!: string;

  @Column({ type: 'uuid', name: 'to_unit_id' })
  toUnitId!: string;

  /** 1 fromUnit = factor * toUnit (e.g. 1 T = 1000 KG → factor 1000) */
  @Column({ type: 'decimal', precision: 20, scale: 10 })
  factor!: string;

  @Column({ type: 'boolean', name: 'is_system', default: false })
  isSystem!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity, { nullable: true })
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity | null;

  @ManyToOne(() => UnitOfMeasureEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'from_unit_id' })
  fromUnit!: UnitOfMeasureEntity;

  @ManyToOne(() => UnitOfMeasureEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'to_unit_id' })
  toUnit!: UnitOfMeasureEntity;
}
