import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { SeasonEntity } from './SeasonEntity.js';
import { OperationEntity } from './OperationEntity.js';
import { MachineEntity } from './MachineEntity.js';
import { AssetEntity } from './AssetEntity.js';
import { FieldEntity } from './FieldEntity.js';
import { CostCenterEntity } from './CostCenterEntity.js';
import { OperationRecordWorkerEntity } from './OperationRecordWorkerEntity.js';
import { OperationRecordProductEntity } from './OperationRecordProductEntity.js';

@Entity('operation_records')
export class OperationRecordEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'date', name: 'service_date' })
  serviceDate!: Date;

  @Column({ type: 'uuid', name: 'season_id', nullable: true })
  seasonId!: string | null;

  @Column({ type: 'uuid', name: 'operation_id' })
  operationId!: string;

  @Column({ type: 'uuid', name: 'machine_id' })
  machineId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'horimeter_start' })
  horimeterStart!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'horimeter_end' })
  horimeterEnd!: number;

  @Column({ type: 'uuid', name: 'implement_id', nullable: true })
  implementId!: string | null;

  @Column({ type: 'uuid', name: 'field_id' })
  fieldId!: string;

  @Column({ type: 'uuid', name: 'cost_center_id' })
  costCenterId!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => SeasonEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'season_id' })
  season?: SeasonEntity | null;

  @ManyToOne(() => OperationEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'operation_id' })
  operation!: OperationEntity;

  @ManyToOne(() => MachineEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'machine_id' })
  machine!: MachineEntity;

  @ManyToOne(() => AssetEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'implement_id' })
  implement?: AssetEntity | null;

  @ManyToOne(() => FieldEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @ManyToOne(() => CostCenterEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter!: CostCenterEntity;

  @OneToMany(() => OperationRecordWorkerEntity, (worker) => worker.operationRecord, { cascade: true })
  workers!: OperationRecordWorkerEntity[];

  @OneToMany(() => OperationRecordProductEntity, (product) => product.operationRecord, { cascade: true })
  products!: OperationRecordProductEntity[];
}
