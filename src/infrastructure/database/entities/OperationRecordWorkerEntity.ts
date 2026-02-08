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
import { WorkerEntity } from './WorkerEntity.js';

@Entity('operation_record_workers')
export class OperationRecordWorkerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'operation_record_id' })
  operationRecordId!: string;

  @Column({ type: 'uuid', name: 'worker_id' })
  workerId!: string;

  @Column({ type: 'time', name: 'start_time' })
  startTime!: string;

  @Column({ type: 'time', name: 'end_time' })
  endTime!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OperationRecordEntity, (record) => record.workers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'operation_record_id' })
  operationRecord!: OperationRecordEntity;

  @ManyToOne(() => WorkerEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'worker_id' })
  worker!: WorkerEntity;
}
