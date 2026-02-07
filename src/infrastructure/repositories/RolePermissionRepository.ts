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
    const whereConditions: any = { role };
    
    // If tenantId is provided, get both system-wide and tenant-specific permissions
    // If tenantId is undefined, get all permissions
    // If tenantId is explicitly null in the query, get only system-wide
    if (tenantId !== undefined) {
      whereConditions.tenantId = tenantId === null ? null : In([null, tenantId]);
    }

    const entities = await this.repository.find({
      where: whereConditions,
      relations: ['permission'],
    });

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
    const whereConditions: any = { role, permissionId };
    
    if (tenantId !== undefined) {
      if (tenantId === null) {
        whereConditions.tenantId = null;
      } else {
        // For specific tenant, check both system-wide and tenant-specific
        const entities = await this.repository.find({
          where: [
            { role, permissionId, tenantId: null },
            { role, permissionId, tenantId },
          ],
        });
        
        if (entities.length === 0) {
          return null;
        }
        
        // Prioritize tenant-specific over system-wide
        const tenantSpecific = entities.find(e => e.tenantId === tenantId);
        return this.toDomain(tenantSpecific || entities[0]);
      }
    }

    const entity = await this.repository.findOne({
      where: whereConditions,
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
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
    const whereConditions: any = { role };
    
    if (tenantId !== undefined) {
      whereConditions.tenantId = tenantId;
    }

    await this.repository.delete(whereConditions);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deleteByRoleAndPermissions(
    role: UserRole,
    permissionIds: string[],
    tenantId?: string
  ): Promise<void> {
    const whereConditions: any = {
      role,
      permissionId: In(permissionIds),
    };

    if (tenantId !== undefined) {
      whereConditions.tenantId = tenantId;
    }

    await this.repository.delete(whereConditions);
  }

  async hasPermission(
    role: UserRole,
    permissionId: string,
    tenantId?: string
  ): Promise<boolean> {
    const rolePermission = await this.findByRoleAndPermission(role, permissionId, tenantId);
    return rolePermission !== null;
  }

  /**
   * Convert domain RolePermission entity to TypeORM entity
   */
  private toEntity(rolePermission: RolePermission): RolePermissionEntity {
    const entity = new RolePermissionEntity();
    entity.id = rolePermission.getId();
    entity.role = rolePermission.getRole();
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
      role: entity.role as UserRole,
      permissionId: entity.permissionId,
      tenantId: entity.tenantId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
