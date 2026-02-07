import { PermissionService } from '../services/PermissionService.js';
import { UserRole } from '../../domain/enums/UserRole.js';
import { EntityType } from '../../domain/enums/EntityType.js';
import { PermissionAction } from '../../domain/enums/PermissionAction.js';

export interface CheckPermissionRequest {
  role: UserRole;
  entity: EntityType;
  action: PermissionAction;
  tenantId?: string;
}

export interface CheckPermissionResponse {
  hasPermission: boolean;
  role: UserRole;
  entity: EntityType;
  action: PermissionAction;
}

export class CheckPermissionUseCase {
  constructor(private permissionService: PermissionService) {}

  async execute(request: CheckPermissionRequest): Promise<CheckPermissionResponse> {
    const { role, entity, action, tenantId } = request;

    const hasPermission = await this.permissionService.hasPermission(
      role,
      entity,
      action,
      tenantId
    );

    return {
      hasPermission,
      role,
      entity,
      action,
    };
  }
}
