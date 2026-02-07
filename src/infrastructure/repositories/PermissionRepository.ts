import { Repository } from 'typeorm';
import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { Permission } from '../../domain/entities/Permission.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';
import { PermissionEntity } from '../database/entities/PermissionEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class PermissionRepository implements IPermissionRepository {
  private repository: Repository<PermissionEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(PermissionEntity);
  }

  async findAll(): Promise<Permission[]> {
    const entities = await this.repository.find({
      order: { entity: 'ASC', action: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<Permission | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    if (!entity) {
      return null;
    }

    return this.toDomain(entity);
  }

  async findByEntityAndAction(
    entity: EntityType,
    action: PermissionAction
  ): Promise<Permission | null> {
    const permissionEntity = await this.repository.findOne({
      where: { entity, action },
    });

    if (!permissionEntity) {
      return null;
    }

    return this.toDomain(permissionEntity);
  }

  async findByEntity(entity: EntityType): Promise<Permission[]> {
    const entities = await this.repository.find({
      where: { entity },
      order: { action: 'ASC' },
    });
    return entities.map(e => this.toDomain(e));
  }

  async save(permission: Permission): Promise<Permission> {
    const entity = this.toEntity(permission);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async saveMany(permissions: Permission[]): Promise<void> {
    const entities = permissions.map(p => this.toEntity(p));
    await this.repository.save(entities);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(entity: EntityType, action: PermissionAction): Promise<boolean> {
    const count = await this.repository.count({
      where: { entity, action },
    });
    return count > 0;
  }

  /**
   * Convert domain Permission entity to TypeORM entity
   */
  private toEntity(permission: Permission): PermissionEntity {
    const entity = new PermissionEntity();
    entity.id = permission.getId();
    entity.entity = permission.getEntity();
    entity.action = permission.getAction();
    entity.description = permission.getDescription();
    entity.createdAt = permission.getCreatedAt();
    entity.updatedAt = permission.getUpdatedAt();
    return entity;
  }

  /**
   * Convert TypeORM entity to domain Permission entity
   */
  private toDomain(entity: PermissionEntity): Permission {
    return new Permission({
      id: entity.id,
      entity: entity.entity as EntityType,
      action: entity.action as PermissionAction,
      description: entity.description,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
