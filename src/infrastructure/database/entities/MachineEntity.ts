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
import { MachineTypeEntity } from './MachineTypeEntity.js';
import { CostCenterEntity } from './CostCenterEntity.js';

@Entity('machines')
export class MachineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'cost_center_id', unique: true, nullable: true })
  costCenterId?: string | null;

  @Column({ type: 'uuid', name: 'machine_type_id' })
  machineTypeId!: string;

  // Dados técnicos
  @Column({ type: 'varchar', length: 100, nullable: true })
  brand?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  model?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'serial_number' })
  serialNumber?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 1, default: 0, name: 'horometer_initial' })
  horimeterInitial!: number;

  @Column({ type: 'decimal', precision: 10, scale: 1, nullable: true, name: 'horometer_current' })
  horimeterCurrent?: number | null;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true, name: 'power_hp' })
  powerHp?: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'fuel_type' })
  fuelType?: string | null; // DIESEL, GASOLINE, ELECTRIC, etc.

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => MachineTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'machine_type_id' })
  machineType!: MachineTypeEntity;

  @OneToOne(() => CostCenterEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter?: CostCenterEntity | null;
}
