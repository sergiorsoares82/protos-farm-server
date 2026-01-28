import { Repository } from 'typeorm';
import type { IOrganizationRepository } from '../../domain/repositories/IOrganizationRepository.js';
import { Organization } from '../../domain/entities/Organization.js';
import { OrganizationEntity } from '../database/entities/OrganizationEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class OrganizationRepository implements IOrganizationRepository {
  private repository: Repository<OrganizationEntity>;

  constructor() {
    // Use entity name string for compatibility with bundled/serverless builds
    this.repository = AppDataSource.getRepository<OrganizationEntity>('OrganizationEntity');
  }

  async findAll(): Promise<Organization[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async findById(id: string): Promise<Organization | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });
    
    if (!entity) {
      return null;
    }
    
    return this.toDomain(entity);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const entity = await this.repository.findOne({
      where: { slug },
    });
    
    if (!entity) {
      return null;
    }
    
    return this.toDomain(entity);
  }

  async save(organization: Organization): Promise<Organization> {
    const entity = this.toEntity(organization);
    const savedEntity = await this.repository.save(entity);
    return this.toDomain(savedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async existsByName(name: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { name },
    });
    return count > 0;
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { slug },
    });
    return count > 0;
  }

  /**
   * Convert domain Organization entity to TypeORM entity
   */
  private toEntity(organization: Organization): OrganizationEntity {
    const entity = new OrganizationEntity();
    entity.id = organization.getId();
    entity.name = organization.getName();
    entity.slug = organization.getSlug();
    entity.isActive = organization.getIsActive();
    entity.createdAt = organization.getCreatedAt();
    entity.updatedAt = organization.getUpdatedAt();
    return entity;
  }

  /**
   * Convert TypeORM entity to domain Organization entity
   */
  private toDomain(entity: OrganizationEntity): Organization {
    return new Organization({
      id: entity.id,
      name: entity.name,
      slug: entity.slug,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
