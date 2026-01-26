import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import type { PersonEntity } from './PersonEntity.js';

@Entity('farm_owners')
export class FarmOwnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  personId!: string;

  @Column({ type: 'varchar', length: 255, name: 'farm_name' })
  farmName!: string;

  @Column({ type: 'text', name: 'farm_location', nullable: true })
  farmLocation!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_area', nullable: true })
  totalArea!: number | null;

  @Column({ type: 'varchar', length: 50, name: 'ownership_type', nullable: true })
  ownershipType!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToOne('PersonEntity', (person: any) => person.farmOwner, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;
}
