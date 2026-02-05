import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';
import { LandRegistryEntity } from './LandRegistryEntity.js';

@Entity('state_registration_land_registries')
@Unique(['stateRegistrationId', 'landRegistryId'])
export class StateRegistrationLandRegistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'state_registration_id' })
  @Index()
  stateRegistrationId!: string;

  @Column({ type: 'uuid', name: 'land_registry_id' })
  @Index()
  landRegistryId!: string;

  @ManyToOne(() => StateRegistrationEntity, (sr) => sr.landRegistryLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'state_registration_id' })
  stateRegistration!: StateRegistrationEntity;

  @ManyToOne(() => LandRegistryEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'land_registry_id' })
  landRegistry!: LandRegistryEntity;
}
