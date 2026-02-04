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
import { RuralPropertyEntity } from './RuralPropertyEntity.js';
import { PropertyOwnershipEntity } from './PropertyOwnershipEntity.js';

@Entity('land_registries')
export class LandRegistryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'rural_property_id', nullable: true })
  ruralPropertyId!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'numero_matricula' })
  numeroMatricula!: string;

  @Column({ type: 'varchar', length: 255, name: 'cartorio' })
  cartorio!: string;

  @Column({ type: 'date', name: 'data_registro', nullable: true })
  dataRegistro!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'registro', nullable: true })
  registro!: string | null;

  @Column({ type: 'varchar', length: 100, name: 'livro_ou_ficha', nullable: true })
  livroOuFicha!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'area_ha', nullable: true })
  areaHa!: number | null;

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

  @ManyToOne(() => RuralPropertyEntity, (rp) => rp.landRegistries, { nullable: true })
  @JoinColumn({ name: 'rural_property_id' })
  ruralProperty!: RuralPropertyEntity | null;

  @OneToMany(() => PropertyOwnershipEntity, (po) => po.landRegistry)
  propertyOwnerships!: PropertyOwnershipEntity[];
}

