import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.js';

export interface CreateRoleRequest {
  name: string;
  displayName: string;
  description: string;
}

export class CreateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: CreateRoleRequest): Promise<Role> {
    const { name, displayName, description } = request;

    // Check if role already exists
    const exists = await this.roleRepository.existsByName(name);
    if (exists) {
      throw new Error(`Role ${name} already exists`);
    }

    // Create custom role
    const role = Role.createCustom(name, displayName, description);

    // Save to database
    return await this.roleRepository.save(role);
  }
}
