import { PermissionService } from '../services/PermissionService.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { Permission } from '../../domain/entities/Permission.js';

export class GetRolePermissionsUseCase {
  constructor(private permissionService: PermissionService) {}

  async execute(role: UserRole, tenantId?: string): Promise<Permission[]> {
    return await this.permissionService.getRolePermissions(role, tenantId);
  }
}
