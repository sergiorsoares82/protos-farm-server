import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { FarmEntity } from './FarmEntity.js';
import { RuralPropertyEntity } from './RuralPropertyEntity.js';

/**
 * Join table: Farm (fazenda) <-> RuralProperty (imóvel rural).
 * One farm can be linked to one or more rural properties.
 */
@Entity('farm_rural_properties')
@Unique(['tenantId', 'farmId', 'ruralPropertyId'])
export class FarmRuralPropertyEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'farm_id' })
  @Index()
  farmId!: string;

  @Column({ type: 'uuid', name: 'rural_property_id' })
  @Index()
  ruralPropertyId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => FarmEntity, (farm) => farm.farmRuralProperties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farm_id' })
  farm!: FarmEntity;

  @ManyToOne(() => RuralPropertyEntity, (rp) => rp.farmRuralProperties, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rural_property_id' })
  ruralProperty!: RuralPropertyEntity;
}
