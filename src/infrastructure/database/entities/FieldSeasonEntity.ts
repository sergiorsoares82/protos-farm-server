import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { FieldEntity } from './FieldEntity.js';
import { SeasonEntity } from './SeasonEntity.js';
import { CostCenterEntity } from './CostCenterEntity.js';

@Entity('field_seasons')
@Unique(['fieldId', 'seasonId'])
export class FieldSeasonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'uuid', name: 'field_id' })
  fieldId!: string;

  @Column({ type: 'uuid', name: 'season_id' })
  seasonId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'area_hectares' })
  areaHectares!: string;

  @Column({ type: 'uuid', name: 'cost_center_id' })
  costCenterId!: string;

  @ManyToOne(() => FieldEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field!: FieldEntity;

  @ManyToOne(() => SeasonEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'season_id' })
  season!: SeasonEntity;

  @ManyToOne(() => CostCenterEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'cost_center_id' })
  costCenter!: CostCenterEntity;
}

