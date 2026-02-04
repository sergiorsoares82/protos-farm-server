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
import { ProductionSiteEntity } from './ProductionSiteEntity.js';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';

@Entity('production_site_state_registrations')
export class ProductionSiteStateRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'production_site_id' })
  @Index()
  productionSiteId!: string;

  @Column({ type: 'uuid', name: 'state_registration_id' })
  @Index()
  stateRegistrationId!: string;

  @Column({ type: 'date', name: 'data_inicio_vigencia' })
  dataInicioVigencia!: string;

  @Column({ type: 'date', name: 'data_fim_vigencia', nullable: true })
  dataFimVigencia!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(
    () => ProductionSiteEntity,
    (productionSite) => productionSite.stateRegistrations,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'production_site_id' })
  productionSite!: ProductionSiteEntity;

  @ManyToOne(
    () => StateRegistrationEntity,
    (stateRegistration) => stateRegistration.productionSiteLinks,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'state_registration_id' })
  stateRegistration!: StateRegistrationEntity;
}

