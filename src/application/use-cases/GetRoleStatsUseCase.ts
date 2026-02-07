import type { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';

export interface GetRoleStatsRequest {
  roleId: string;
}

export interface GetRoleStatsResponse {
  roleId: string;
  roleName: string;
  userCount: number;
  canBeDeleted: boolean;
  deletionBlockedReason?: string;
}

export class GetRoleStatsUseCase {
  constructor(private roleRepository: IRoleRepository) {}

  async execute(request: GetRoleStatsRequest): Promise<GetRoleStatsResponse> {
    const { roleId } = request;

    const role = await this.roleRepository.findById(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    const userCount = await this.roleRepository.countUsers(roleId);
    const canBeDeleted = role.getCanBeDeleted() && userCount === 0;
    
    let deletionBlockedReason: string | undefined;
    if (!role.getCanBeDeleted()) {
      deletionBlockedReason = 'System role cannot be deleted';
    } else if (userCount > 0) {
      deletionBlockedReason = `Role is assigned to ${userCount} user(s)`;
    }

    return {
      roleId: role.getId(),
      roleName: role.getName(),
      userCount,
      canBeDeleted,
      deletionBlockedReason,
    };
  }
}
