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
import { FarmRuralPropertyEntity } from './FarmRuralPropertyEntity.js';

@Entity('farms')
export class FarmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 255, name: 'name' })
  name!: string;

  @Column({ type: 'text', name: 'location', nullable: true })
  location!: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_area', nullable: true })
  totalArea!: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @OneToMany('FarmOwnerEntity', (fo: any) => fo.farm)
  farmOwners!: any[];

  @OneToMany(() => FarmRuralPropertyEntity, (frp) => frp.farm)
  farmRuralProperties!: FarmRuralPropertyEntity[];
}
