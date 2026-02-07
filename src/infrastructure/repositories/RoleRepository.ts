import { Repository, DataSource } from 'typeorm';
import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.js';
import { RoleEntity } from '../database/entities/RoleEntity.js';
import { UserEntity } from '../database/entities/UserEntity.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class RoleRepository implements IRoleRepository {
  private repository: Repository<RoleEntity>;

  constructor(dataSource?: DataSource) {
    const source = dataSource || AppDataSource;
    this.repository = source.getRepository(RoleEntity);
  }

  async findAll(): Promise<Role[]> {
    const entities = await this.repository.find({
      order: { isSystem: 'DESC', name: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const entity = await this.repository.findOne({ where: { name: name.toUpperCase() } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(role: Role): Promise<Role> {
    const entity = this.toEntity(role);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({ where: { name: name.toUpperCase() } });
    return count > 0;
  }

  async hasUsers(roleId: string): Promise<boolean> {
    const count = await this.countUsers(roleId);
    return count > 0;
  }

  async countUsers(roleId: string): Promise<number> {
    const role = await this.findById(roleId);
    if (!role) return 0;
    const roleName = role.getName();
    // Users table uses enum (SUPER_ADMIN, ORG_ADMIN, USER); custom roles are not assignable yet
    const systemRoleNames = Object.values(UserRole);
    if (!systemRoleNames.includes(roleName as UserRole)) {
      return 0;
    }
    const userRepo = AppDataSource.getRepository(UserEntity);
    return await userRepo.count({ where: { role: roleName as UserRole } });
  }

  async findSystemRoles(): Promise<Role[]> {
    const entities = await this.repository.find({
      where: { isSystem: true },
      order: { name: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  async findCustomRoles(): Promise<Role[]> {
    const entities = await this.repository.find({
      where: { isSystem: false },
      order: { name: 'ASC' },
    });
    return entities.map(entity => this.toDomain(entity));
  }

  // Mappers
  private toEntity(role: Role): RoleEntity {
    const entity = new RoleEntity();
    entity.id = role.getId();
    entity.name = role.getName();
    entity.displayName = role.getDisplayName();
    entity.description = role.getDescription();
    entity.isSystem = role.getIsSystem();
    entity.canBeDeleted = role.getCanBeDeleted();
    entity.createdAt = role.getCreatedAt();
    entity.updatedAt = role.getUpdatedAt();
    return entity;
  }

  private toDomain(entity: RoleEntity): Role {
    return new Role({
      id: entity.id,
      name: entity.name,
      displayName: entity.displayName,
      description: entity.description || '',
      isSystem: entity.isSystem,
      canBeDeleted: entity.canBeDeleted,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
