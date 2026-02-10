import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { PermissionEntity } from './PermissionEntity.js';
import { RoleEntity } from './RoleEntity.js';

@Entity('role_permissions')
@Index(['role', 'tenantId'])
@Index(['roleId', 'tenantId'])
@Index(['permissionId'])
@Index(['role', 'permissionId', 'tenantId'], { unique: true, where: 'role IS NOT NULL' })
@Index(['roleId', 'permissionId', 'tenantId'], { unique: true, where: 'role_id IS NOT NULL' })
export class RolePermissionEntity {
  @PrimaryColumn('uuid')
  id!: string;

  /** System role (SUPER_ADMIN, ORG_ADMIN, USER). Null when roleId is set (custom role). */
  @Column({ type: 'varchar', length: 50, nullable: true })
  role!: string | null;

  /** Custom role FK. Null when role (system) is set. */
  @Column({ type: 'uuid', name: 'role_id', nullable: true })
  roleId!: string | null;

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

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  roleEntity?: RoleEntity | null;
}
