import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './OrganizationEntity.js';
import { MachineTypeEntity } from './MachineTypeEntity.js';

@Entity('machines')
export class MachineEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'tenant_id' })
  @Index()
  tenantId!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'uuid', name: 'machine_type_id' })
  machineTypeId!: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'tenant_id' })
  tenant!: OrganizationEntity;

  @ManyToOne(() => MachineTypeEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'machine_type_id' })
  machineType!: MachineTypeEntity;
}
