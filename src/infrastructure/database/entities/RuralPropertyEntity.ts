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
import { LandRegistryEntity } from './LandRegistryEntity.js';
import { FarmRuralPropertyEntity } from './FarmRuralPropertyEntity.js';
import { StateRegistrationEntity } from './StateRegistrationEntity.js';

@Entity('rural_properties')
export class RuralPropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 100, name: 'codigo_sncr', nullable: true })
  @Index()
  codigoSncr!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'nirf', nullable: true })
  nirf!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'nome_imovel_incra' })
  nomeImovelIncra!: string;

  @Column({ type: 'varchar', length: 150, name: 'municipio', nullable: true })
  municipio!: string | null;

  @Column({ type: 'varchar', length: 2, name: 'uf', nullable: true })
  uf!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @OneToMany(() => LandRegistryEntity, (lr) => lr.ruralProperty)
  landRegistries!: LandRegistryEntity[];

  @OneToMany(() => FarmRuralPropertyEntity, (frp) => frp.ruralProperty)
  farmRuralProperties!: FarmRuralPropertyEntity[];

  @OneToMany(() => StateRegistrationEntity, (sr) => sr.ruralProperty)
  stateRegistrations!: StateRegistrationEntity[];
}

