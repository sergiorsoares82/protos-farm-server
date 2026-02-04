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
import { LandRegistryEntity } from './LandRegistryEntity.js';

@Entity('production_site_parcels')
export class ProductionSiteParcelEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'production_site_id' })
  @Index()
  productionSiteId!: string;

  @Column({ type: 'uuid', name: 'land_registry_id' })
  @Index()
  landRegistryId!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'area_ha', nullable: true })
  areaHa!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(
    () => ProductionSiteEntity,
    (productionSite) => productionSite.parcels,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'production_site_id' })
  productionSite!: ProductionSiteEntity;

  @ManyToOne(
    () => LandRegistryEntity,
    (landRegistry) => landRegistry.propertyOwnerships,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'land_registry_id' })
  landRegistry!: LandRegistryEntity;
}

