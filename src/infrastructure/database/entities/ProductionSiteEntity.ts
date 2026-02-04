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
import { FarmEntity } from './FarmEntity.js';
import { ProductionSiteParcelEntity } from './ProductionSiteParcelEntity.js';
import { ProductionSiteStateRegistrationEntity } from './ProductionSiteStateRegistrationEntity.js';

@Entity('production_sites')
export class ProductionSiteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'farm_id' })
  @Index()
  farmId!: string;

  @Column({ type: 'varchar', length: 255, name: 'nome_bloco' })
  nomeBloco!: string;

  @Column({ type: 'text', name: 'descricao', nullable: true })
  descricao!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => FarmEntity, (farm) => farm.farmOwners, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: FarmEntity;

  @OneToMany(() => ProductionSiteParcelEntity, (psp) => psp.productionSite)
  parcels!: ProductionSiteParcelEntity[];

  @OneToMany(
    () => ProductionSiteStateRegistrationEntity,
    (pssr) => pssr.productionSite,
  )
  stateRegistrations!: ProductionSiteStateRegistrationEntity[];
}

