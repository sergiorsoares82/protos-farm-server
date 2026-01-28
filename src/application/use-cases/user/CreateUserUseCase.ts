import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import { User } from '../../../domain/entities/User.js';
import type { CreateUserRequestDTO, UserResponseDTO } from '../../dtos/UserManagementDTOs.js';

export class CreateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(request: CreateUserRequestDTO): Promise<UserResponseDTO> {
    // Check if email already exists
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }
    
    // Create user with role
    const user = await User.create(
      request.email,
      request.password,
      request.tenantId,
      request.role
    );
    
    // Save user
    const savedUser = await this.userRepository.save(user);
    
    return {
      id: savedUser.getId(),
      email: savedUser.getEmail().getValue(),
      role: savedUser.getRole(),
      tenantId: savedUser.getTenantId(),
      createdAt: savedUser.getCreatedAt(),
      updatedAt: savedUser.getUpdatedAt(),
    };
  }
}
