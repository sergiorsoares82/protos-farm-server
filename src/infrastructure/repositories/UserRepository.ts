import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.js';
import { Email } from '../../domain/value-objects/Email.js';
import { Password } from '../../domain/value-objects/Password.js';
import { UserEntity } from '../database/entities/UserEntity.js';
import { AppDataSource } from '../database/typeorm.config.js';

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    // Use the entity class directly; this matches the entity metadata
    // registered in AppDataSource.entities.
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!userEntity) {
      return null;
    }

    return this.toDomain(userEntity);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.repository.findOne({
      where: { id },
    });

    if (!userEntity) {
      return null;
    }

    return this.toDomain(userEntity);
  }

  async save(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    const savedEntity = await this.repository.save(userEntity);
    return this.toDomain(savedEntity);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  async findAll(tenantId?: string): Promise<User[]> {
    const where = tenantId ? { tenantId } : {};
    const entities = await this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async findByTenant(tenantId: string): Promise<User[]> {
    const entities = await this.repository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async findByIdWithPerson(id: string): Promise<UserEntity | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['person'],
    });
  }

  async findAllWithPerson(tenantId?: string): Promise<UserEntity[]> {
    const where = tenantId ? { tenantId } : {};
    return await this.repository.find({
      where,
      relations: ['person'],
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  /**
   * Convert domain User entity to TypeORM entity
   */
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.getId();
    entity.tenantId = user.getTenantId();
    entity.email = user.getEmail().getValue();
    entity.password = user.getPassword().getHashedValue();
    entity.role = user.getRole();
    entity.personId = user.getPersonId() || null;
    entity.createdAt = user.getCreatedAt();
    entity.updatedAt = user.getUpdatedAt();
    return entity;
  }

  /**
   * Convert TypeORM entity to domain User entity
   */
  private toDomain(entity: UserEntity): User {
    const emailVO = new Email(entity.email);
    const passwordVO = Password.fromHash(entity.password);

    return new User({
      id: entity.id,
      tenantId: entity.tenantId,
      email: emailVO,
      password: passwordVO,
      role: entity.role,
      personId: entity.personId || undefined,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
