import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OperationRecordEntity } from './OperationRecordEntity.js';
import { ItemEntity } from './ItemEntity.js';
import { UnitOfMeasureEntity } from './UnitOfMeasureEntity.js';

@Entity('operation_record_products')
export class OperationRecordProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'operation_record_id' })
  operationRecordId!: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity!: number;

  @Column({ type: 'uuid', name: 'unit_of_measure_id' })
  unitOfMeasureId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OperationRecordEntity, (record) => record.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'operation_record_id' })
  operationRecord!: OperationRecordEntity;

  @ManyToOne(() => ItemEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_id' })
  product!: ItemEntity;

  @ManyToOne(() => UnitOfMeasureEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_of_measure_id' })
  unitOfMeasure!: UnitOfMeasureEntity;
}
