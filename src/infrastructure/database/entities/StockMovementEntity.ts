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

@Entity('stock_movements')
export class StockMovementEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'date', name: 'movement_date' })
  movementDate!: string;

  @Column({ type: 'uuid', name: 'stock_movement_type_id' })
  stockMovementTypeId!: string;

  @Column({ type: 'uuid', name: 'item_id' })
  itemId!: string;

  @Column({ type: 'varchar', length: 50 })
  unit!: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  quantity!: number;

  @Column({ type: 'uuid', name: 'work_location_id', nullable: true })
  workLocationId!: string | null;

  @Column({ type: 'uuid', name: 'season_id', nullable: true })
  seasonId!: string | null;

  @Column({ type: 'uuid', name: 'cost_center_id', nullable: true })
  costCenterId!: string | null;

  @Column({ type: 'uuid', name: 'management_account_id', nullable: true })
  managementAccountId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;
}
