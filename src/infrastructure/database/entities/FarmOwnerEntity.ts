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
import type { PersonEntity } from './PersonEntity.js';
import { FarmEntity } from './FarmEntity.js';
import { OrganizationEntity } from './OrganizationEntity.js';

/**
 * Join table: Person (proprietário) <-> Farm (fazenda).
 * One person can own many farms; one farm can have many owners.
 * farm_id nullable: person can have role "proprietário" with no farm linked yet.
 */
@Entity('farm_owners')
@Unique(['personId', 'farmId'])
export class FarmOwnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  personId!: string;

  @Column({ type: 'uuid', name: 'farm_id', nullable: true })
  farmId!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'ownership_type', nullable: true })
  ownershipType!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne('PersonEntity', (person: any) => person.farmOwners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;

  @ManyToOne(() => FarmEntity, (farm) => farm.farmOwners, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'farm_id' })
  farm!: FarmEntity | null;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;
}
