import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PermissionEntity } from './PermissionEntity.js';

@Entity('role_permissions')
@Index(['role', 'tenantId'])
@Index(['permissionId'])
@Index(['role', 'permissionId', 'tenantId'], { unique: true })
export class RolePermissionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  role!: string;

  @Column({ type: 'uuid', name: 'permission_id' })
  permissionId!: string;

  @Column({ type: 'uuid', name: 'tenant_id', nullable: true })
  tenantId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => PermissionEntity, { eager: true })
  @JoinColumn({ name: 'permission_id' })
  permission!: PermissionEntity;
}
