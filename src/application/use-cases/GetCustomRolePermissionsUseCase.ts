import { PermissionService } from '../services/PermissionService.js';
import { Permission } from '../../domain/entities/Permission.js';

export class GetCustomRolePermissionsUseCase {
  constructor(private permissionService: PermissionService) {}

  async execute(roleId: string, tenantId?: string): Promise<Permission[]> {
    return await this.permissionService.getRolePermissionsByRoleId(roleId, tenantId);
  }
}
