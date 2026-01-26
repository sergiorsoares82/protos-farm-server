import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import type { PersonEntity } from './PersonEntity.js';

@Entity('workers')
export class WorkerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  personId!: string;

  @Column({ type: 'varchar', length: 100 })
  position!: string;

  @Column({ type: 'date', name: 'hire_date' })
  hireDate!: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'hourly_rate', nullable: true })
  hourlyRate!: number | null;

  @Column({ type: 'varchar', length: 50, name: 'employment_type' })
  employmentType!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne('PersonEntity', (person: any) => person.worker, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;
}
