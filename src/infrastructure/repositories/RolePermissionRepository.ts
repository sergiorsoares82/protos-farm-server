import { Repository } from 'typeorm';
import type { IRolePermissionRepository } from '../../domain/repositories/IRolePermissionRepository.js';
import { RolePermission } from '../../domain/entities/RolePermission.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { RolePermissionEntity } from '../database/entities/RolePermissionEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';
import { In } from 'typeorm';

export class RolePermissionRepository implements IRolePermissionRepository {
  private repository: Repository<RolePermissionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(RolePermissionEntity);
  }

  async findByRole(role: UserRole, tenantId?: string): Promise<RolePermission[]> {
    const qb = this.repository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .where('rp.role = :role', { role })
      .andWhere('rp.roleId IS NULL');

    if (tenantId !== undefined) {
      if (tenantId === null) {
        qb.andWhere('rp.tenantId IS NULL');
      } else {
        qb.andWhere('(rp.tenantId IS NULL OR rp.tenantId = :tenantId)', { tenantId });
      }
    }

    const entities = await qb.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async findByRoleAndEntity(
    role: UserRole,
    entity: EntityType,
    tenantId?: string
  ): Promise<RolePermission[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .where('rp.role = :role', { role })
      .andWhere('rp.roleId IS NULL')
      .andWhere('p.entity = :entity', { entity });

    if (tenantId !== undefined) {
      if (tenantId === null) {
        queryBuilder.andWhere('rp.tenantId IS NULL');
      } else {
        queryBuilder.andWhere('(rp.tenantId IS NULL OR rp.tenantId = :tenantId)', { tenantId });
      }
    }

    const entities = await queryBuilder.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async findByRoleAndPermission(
    role: UserRole,
    permissionId: string,
    tenantId?: string
  ): Promise<RolePermission | null> {
    const qb = this.repository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .where('rp.role = :role', { role })
      .andWhere('rp.roleId IS NULL')
      .andWhere('rp.permissionId = :permissionId', { permissionId });

    if (tenantId !== undefined) {
      if (tenantId === null) {
        qb.andWhere('rp.tenantId IS NULL');
      } else {
        qb.andWhere('(rp.tenantId IS NULL OR rp.tenantId = :tenantId)', { tenantId });
      }
    }

    const entities = await qb.getMany();
    if (entities.length === 0) return null;
    const tenantSpecific = tenantId ? entities.find(e => e.tenantId === tenantId) : null;
    const chosen = tenantSpecific ?? entities[0];
    return this.toDomain(chosen!);
  }

  async save(rolePermission: RolePermission): Promise<RolePermission> {
    const entity = this.toEntity(rolePermission);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async saveMany(rolePermissions: RolePermission[]): Promise<void> {
    const entities = rolePermissions.map(rp => this.toEntity(rp));
    await this.repository.save(entities);
  }

  async deleteByRole(role: UserRole, tenantId?: string): Promise<void> {
    const qb = this.repository
      .createQueryBuilder()
      .delete()
      .where('role = :role', { role })
      .andWhere('roleId IS NULL');
    if (tenantId !== undefined) {
      qb.andWhere('tenantId = :tenantId', { tenantId: tenantId ?? null });
    }
    await qb.execute();
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByRoleAndPermissions(
    role: UserRole,
    permissionIds: string[],
    tenantId?: string
  ): Promise<void> {
    const qb = this.repository
      .createQueryBuilder()
      .delete()
      .where('role = :role', { role })
      .andWhere('roleId IS NULL')
      .andWhere('permissionId IN (:...permissionIds)', { permissionIds });
    if (tenantId !== undefined) {
      qb.andWhere('tenantId = :tenantId', { tenantId: tenantId ?? null });
    }
    await qb.execute();
  }

  async hasPermission(
    role: UserRole,
    permissionId: string,
    tenantId?: string
  ): Promise<boolean> {
    const rolePermission = await this.findByRoleAndPermission(role, permissionId, tenantId);
    return rolePermission !== null;
  }

  async findByRoleId(roleId: string, tenantId?: string): Promise<RolePermission[]> {
    const qb = this.repository
      .createQueryBuilder('rp')
      .leftJoinAndSelect('rp.permission', 'p')
      .where('rp.roleId = :roleId', { roleId });

    if (tenantId !== undefined) {
      if (tenantId === null) {
        qb.andWhere('rp.tenantId IS NULL');
      } else {
        qb.andWhere('(rp.tenantId IS NULL OR rp.tenantId = :tenantId)', { tenantId });
      }
    }

    const entities = await qb.getMany();
    return entities.map(entity => this.toDomain(entity));
  }

  async deleteByRoleId(roleId: string, tenantId?: string): Promise<void> {
    const qb = this.repository
      .createQueryBuilder()
      .delete()
      .where('roleId = :roleId', { roleId });
    if (tenantId !== undefined) {
      qb.andWhere('tenantId = :tenantId', { tenantId: tenantId ?? null });
    }
    await qb.execute();
  }

  async hasPermissionForRoleId(
    roleId: string,
    permissionId: string,
    tenantId?: string
  ): Promise<boolean> {
    const qb = this.repository
      .createQueryBuilder('rp')
      .where('rp.roleId = :roleId', { roleId })
      .andWhere('rp.permissionId = :permissionId', { permissionId });
    if (tenantId !== undefined) {
      if (tenantId === null) {
        qb.andWhere('rp.tenantId IS NULL');
      } else {
        qb.andWhere('(rp.tenantId IS NULL OR rp.tenantId = :tenantId)', { tenantId });
      }
    }
    const count = await qb.getCount();
    return count > 0;
  }

  /**
   * Convert domain RolePermission entity to TypeORM entity
   */
  private toEntity(rolePermission: RolePermission): RolePermissionEntity {
    const entity = new RolePermissionEntity();
    entity.id = rolePermission.getId();
    entity.role = rolePermission.getRole();
    entity.roleId = rolePermission.getRoleId();
    entity.permissionId = rolePermission.getPermissionId();
    entity.tenantId = rolePermission.getTenantId();
    entity.createdAt = rolePermission.getCreatedAt();
    entity.updatedAt = rolePermission.getUpdatedAt();
    return entity;
  }

  /**
   * Convert TypeORM entity to domain RolePermission entity
   */
  private toDomain(entity: RolePermissionEntity): RolePermission {
    return new RolePermission({
      id: entity.id,
      role: entity.role as UserRole | null,
      roleId: entity.roleId,
      permissionId: entity.permissionId,
      tenantId: entity.tenantId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
