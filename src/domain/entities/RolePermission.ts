import { UserRole } from '../enums/UserRole.js';

export interface RolePermissionProps {
  id: string;
  role: UserRole | null;
  roleId: string | null;
  permissionId: string;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RolePermission {
  private readonly id: string;
  private readonly role: UserRole | null;
  private readonly roleId: string | null;
  private readonly permissionId: string;
  private readonly tenantId: string | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: RolePermissionProps) {
    this.id = props.id;
    this.role = props.role;
    this.roleId = props.roleId;
    this.permissionId = props.permissionId;
    this.tenantId = props.tenantId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new role permission for a system role (UserRole)
   */
  static create(
    role: UserRole,
    permissionId: string,
    tenantId: string | null = null
  ): RolePermission {
    const now = new Date();
    return new RolePermission({
      id: crypto.randomUUID(),
      role,
      roleId: null,
      permissionId,
      tenantId,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Factory method to create a role permission for a custom role (by role entity id)
   */
  static createForCustomRole(
    roleId: string,
    permissionId: string,
    tenantId: string | null = null
  ): RolePermission {
    const now = new Date();
    return new RolePermission({
      id: crypto.randomUUID(),
      role: null,
      roleId,
      permissionId,
      tenantId,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Check if this is a system-wide permission (not tenant-specific)
   */
  isSystemWide(): boolean {
    return this.tenantId === null;
  }

  /**
   * Check if this permission applies to a specific tenant
   */
  appliesToTenant(tenantId: string): boolean {
    return this.tenantId === null || this.tenantId === tenantId;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getRole(): UserRole | null {
    return this.role;
  }

  getRoleId(): string | null {
    return this.roleId;
  }

  isCustomRole(): boolean {
    return this.roleId !== null;
  }

  getPermissionId(): string {
    return this.permissionId;
  }

  getTenantId(): string | null {
    return this.tenantId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // For serialization
  toJSON() {
    return {
      id: this.id,
      role: this.role,
      roleId: this.roleId,
      permissionId: this.permissionId,
      tenantId: this.tenantId,
      isSystemWide: this.isSystemWide(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
