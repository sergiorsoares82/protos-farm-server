import { UserRole } from '../enums/UserRole.js';

export interface RolePermissionProps {
  id: string;
  role: UserRole;
  permissionId: string;
  tenantId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class RolePermission {
  private readonly id: string;
  private readonly role: UserRole;
  private readonly permissionId: string;
  private readonly tenantId: string | null;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: RolePermissionProps) {
    this.id = props.id;
    this.role = props.role;
    this.permissionId = props.permissionId;
    this.tenantId = props.tenantId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new role permission
   * @param role - User role
   * @param permissionId - Permission ID
   * @param tenantId - Optional tenant ID (null for system-wide permissions)
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

  getRole(): UserRole {
    return this.role;
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
      permissionId: this.permissionId,
      tenantId: this.tenantId,
      isSystemWide: this.isSystemWide(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
