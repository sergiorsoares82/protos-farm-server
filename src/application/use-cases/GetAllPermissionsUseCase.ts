import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { Permission } from '../../domain/entities/Permission.js';

export class GetAllPermissionsUseCase {
  constructor(private permissionRepository: IPermissionRepository) {}

  async execute(): Promise<Permission[]> {
    return await this.permissionRepository.findAll();
  }
}
