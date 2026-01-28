import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { UserResponseDTO, UserPersonDTO } from '../../dtos/UserManagementDTOs.js';

export class GetUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  /**
   * Get all users (optionally filtered by tenant)
   * Super admin can get all users or filter by tenant
   * Org admin automatically gets only their tenant's users
   */
  async execute(tenantId?: string): Promise<UserResponseDTO[]> {
    const userEntities = await this.userRepository.findAllWithPerson(tenantId);
    
    return userEntities.map(userEntity => ({
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
      tenantId: userEntity.tenantId,
      person: userEntity.person ? {
        id: userEntity.person.id,
        firstName: userEntity.person.firstName,
        lastName: userEntity.person.lastName,
        fullName: `${userEntity.person.firstName} ${userEntity.person.lastName}`,
        email: userEntity.person.email,
      } : undefined,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    }));
  }

  /**
   * Get single user by ID
   */
  async executeById(id: string): Promise<UserResponseDTO> {
    const userEntity = await this.userRepository.findByIdWithPerson(id);
    
    if (!userEntity) {
      throw new Error('User not found');
    }
    
    return {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
      tenantId: userEntity.tenantId,
      person: userEntity.person ? {
        id: userEntity.person.id,
        firstName: userEntity.person.firstName,
        lastName: userEntity.person.lastName,
        fullName: `${userEntity.person.firstName} ${userEntity.person.lastName}`,
        email: userEntity.person.email,
      } : undefined,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    };
  }
}
