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
import { LandRegistryEntity } from './LandRegistryEntity.js';
import { PersonEntity } from './PersonEntity.js';

@Entity('property_ownerships')
export class PropertyOwnershipEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'land_registry_id' })
  @Index()
  landRegistryId!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  @Index()
  personId!: string;

  @Column({ type: 'decimal', precision: 7, scale: 4, name: 'percentual_posse', nullable: true })
  percentualPosse!: number | null;

  @Column({ type: 'date', name: 'data_aquisicao', nullable: true })
  dataAquisicao!: string | null;

  @Column({ type: 'date', name: 'data_baixa', nullable: true })
  dataBaixa!: string | null;

  @Column({ type: 'varchar', length: 50, name: 'tipo_aquisicao', nullable: true })
  tipoAquisicao!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => LandRegistryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'land_registry_id' })
  landRegistry!: LandRegistryEntity;

  @ManyToOne(() => PersonEntity, (p) => p.farmOwners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;
}

