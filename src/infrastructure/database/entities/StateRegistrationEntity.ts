import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { PersonEntity } from './PersonEntity.js';
import { ProductionSiteStateRegistrationEntity } from './ProductionSiteStateRegistrationEntity.js';

@Entity('state_registrations')
export class StateRegistrationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'person_id' })
  @Index()
  personId!: string;

  @Column({ type: 'varchar', length: 50, name: 'numero_ie' })
  numeroIe!: string;

  @Column({ type: 'varchar', length: 2, name: 'uf' })
  uf!: string;

  @Column({ type: 'varchar', length: 20, name: 'situacao', default: 'ATIVA' })
  situacao!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => PersonEntity, (p) => p.farmOwners)
  @JoinColumn({ name: 'person_id' })
  person!: PersonEntity;

  @OneToMany(
    () => ProductionSiteStateRegistrationEntity,
    (pssr) => pssr.stateRegistration,
  )
  productionSiteLinks!: ProductionSiteStateRegistrationEntity[];
}

