import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.js';

export class GetAllRolesUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return await this.roleRepository.findAll();
  }
}
