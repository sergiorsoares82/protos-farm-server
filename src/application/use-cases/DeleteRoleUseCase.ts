import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';

export interface DeleteRoleRequest {
  id: string;
}

export class DeleteRoleUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: DeleteRoleRequest): Promise<void> {
    const { id } = request;

    // Find role
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new Error(`Role with ID ${id} not found`);
    }

    // Check if role can be deleted
    role.validateDeletion();

    // Check if role has users
    const hasUsers = await this.roleRepository.hasUsers(id);
    if (hasUsers) {
      const userCount = await this.roleRepository.countUsers(id);
      throw new Error(
        `Cannot delete role ${role.getName()}. It is assigned to ${userCount} user(s). ` +
        `Please reassign these users to another role first.`
      );
    }

    // Delete role
    await this.roleRepository.delete(id);
  }
}
