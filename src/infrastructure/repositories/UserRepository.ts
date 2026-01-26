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

  /**
   * Convert domain User entity to TypeORM entity
   */
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.getId();
    entity.email = user.getEmail().getValue();
    entity.password = user.getPassword().getHashedValue();
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
      email: emailVO,
      password: passwordVO,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
