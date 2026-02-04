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
import { FarmEntity } from './FarmEntity.js';
import { ProductionSiteEntity } from './ProductionSiteEntity.js';
import { PersonEntity } from './PersonEntity.js';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';

@Entity('exploration_contracts')
export class ExplorationContractEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'farm_id' })
  @Index()
  farmId!: string;

  @Column({ type: 'uuid', name: 'production_site_id', nullable: true })
  @Index()
  productionSiteId!: string | null;

  @Column({ type: 'uuid', name: 'explorer_id' })
  @Index()
  explorerId!: string;

  @Column({ type: 'uuid', name: 'land_owner_id', nullable: true })
  @Index()
  landOwnerId!: string | null;

  @Column({ type: 'uuid', name: 'state_registration_id', nullable: true })
  @Index()
  stateRegistrationId!: string | null;

  @Column({ type: 'varchar', length: 20, name: 'tipo_contrato' })
  tipoContrato!: string;

  @Column({ type: 'date', name: 'data_inicio' })
  dataInicio!: string;

  @Column({ type: 'date', name: 'data_fim', nullable: true })
  dataFim!: string | null;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    name: 'valor_contrato',
    nullable: true,
  })
  valorContrato!: number | null;

  @Column({ type: 'text', name: 'observacoes', nullable: true })
  observacoes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => FarmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: FarmEntity;

  @ManyToOne(() => ProductionSiteEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'production_site_id' })
  productionSite!: ProductionSiteEntity | null;

  @ManyToOne(() => PersonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'explorer_id' })
  explorer!: PersonEntity;

  @ManyToOne(() => PersonEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'land_owner_id' })
  landOwner!: PersonEntity | null;

  @ManyToOne(() => StateRegistrationEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'state_registration_id' })
  stateRegistration!: StateRegistrationEntity | null;
}

