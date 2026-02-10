import type { IRolePermissionRepository } from '../../domain/repositories/IRolePermissionRepository.js';
import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { RolePermission } from '../../domain/entities/RolePermission.js';

export interface UpdateCustomRolePermissionsRequest {
  roleId: string;
  permissionIds: string[];
  tenantId?: string;
}

export class UpdateCustomRolePermissionsUseCase {
  constructor(
    private rolePermissionRepository: IRolePermissionRepository,
    private permissionRepository: IPermissionRepository,
    private roleRepository: IRoleRepository
  ) {}

  async execute(request: UpdateCustomRolePermissionsRequest): Promise<void> {
    const { roleId, permissionIds, tenantId } = request;

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }
    if (role.getIsSystem()) {
      throw new Error('Cannot assign permissions to system roles via this endpoint; use the system role permissions API');
    }

    const allPermissions = await this.permissionRepository.findAll();
    const validPermissionIds = new Set(allPermissions.map(p => p.getId()));
    for (const permissionId of permissionIds) {
      if (!validPermissionIds.has(permissionId)) {
        throw new Error(`Invalid permission ID: ${permissionId}`);
      }
    }

    await this.rolePermissionRepository.deleteByRoleId(roleId, tenantId);

    const rolePermissions = permissionIds.map(permissionId =>
      RolePermission.createForCustomRole(roleId, permissionId, tenantId ?? null)
    );
    if (rolePermissions.length > 0) {
      await this.rolePermissionRepository.saveMany(rolePermissions);
    }
  }
}
