import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.js';

export interface UpdateRoleRequest {
  id: string;
  displayName?: string;
  description?: string;
}

export class UpdateRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: UpdateRoleRequest): Promise<Role> {
    const { id, displayName, description } = request;

    // Find role
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error(`Role with ID ${id} not found`);
    }

    // Update role
    role.update(displayName, description);

    // Save to database
    return await this.roleRepository.save(role);
  }
}
