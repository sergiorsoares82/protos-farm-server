import type { IRolePermissionRepository } from '../../domain/repositories/IRolePermissionRepository.js';
import type { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { RolePermission } from '../../domain/entities/RolePermission.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { PermissionService } from '../services/PermissionService.js';

export interface UpdateRolePermissionsRequest {
  role: UserRole;
  permissionIds: string[];
  tenantId?: string;
}

export class UpdateRolePermissionsUseCase {
  constructor(
    private rolePermissionRepository: IRolePermissionRepository,
    private permissionRepository: IPermissionRepository,
    private permissionService: PermissionService
  ) {}

  async execute(request: UpdateRolePermissionsRequest): Promise<void> {
    const { role, permissionIds, tenantId } = request;

    // Validate that all permission IDs exist
    const allPermissions = await this.permissionRepository.findAll();
    const validPermissionIds = new Set(allPermissions.map(p => p.getId()));
    
    for (const permissionId of permissionIds) {
      if (!validPermissionIds.has(permissionId)) {
        throw new Error(`Invalid permission ID: ${permissionId}`);
      }
    }

    // Delete existing role permissions
    await this.rolePermissionRepository.deleteByRole(role, tenantId || null);

    // Create new role permissions
    const rolePermissions = permissionIds.map(permissionId =>
      RolePermission.create(role, permissionId, tenantId || null)
    );

    await this.rolePermissionRepository.saveMany(rolePermissions);

    // Clear cache for this role
    this.permissionService.clearCacheForRole(role);
  }
}
