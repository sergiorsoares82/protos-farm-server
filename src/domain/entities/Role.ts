import { v4 as uuidv4 } from 'uuid';

export interface RoleProps {
  id: string;
  name: string;
  displayName: string;
  description: string;
  isSystem: boolean;
  canBeDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Role Domain Entity
 * Represents a user role in the system
 * 
 * System roles (SUPER_ADMIN, ORG_ADMIN) cannot be deleted
 * Custom roles can be created and deleted by SUPER_ADMIN and ORG_ADMIN
 */
export class Role {
  private readonly id: string;
  private name: string;
  private displayName: string;
  private description: string;
  private readonly isSystem: boolean;
  private readonly canBeDeleted: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: RoleProps) {
    this.id = props.id;
    this.name = props.name;
    this.displayName = props.displayName;
    this.description = props.description;
    this.isSystem = props.isSystem;
    this.canBeDeleted = props.canBeDeleted;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  /**
   * Create a new system role (cannot be deleted)
   */
  static createSystem(
    name: string,
    displayName: string,
    description: string
  ): Role {
    return new Role({
      id: uuidv4(),
      name: name.toUpperCase(),
      displayName,
      description,
      isSystem: true,
      canBeDeleted: false,
    });
  }

  /**
   * Create a new custom role (can be deleted)
   */
  static createCustom(
    name: string,
    displayName: string,
    description: string
  ): Role {
    // Validate name format
    if (!/^[A-Z_]+$/.test(name)) {
      throw new Error('Role name must be uppercase with underscores only');
    }

    // Prevent creating roles with system names
    const systemNames = ['SUPER_ADMIN', 'ORG_ADMIN', 'USER'];
    if (systemNames.includes(name.toUpperCase())) {
      throw new Error('Cannot create role with system-reserved name');
    }

    return new Role({
      id: uuidv4(),
      name: name.toUpperCase(),
      displayName,
      description,
      isSystem: false,
      canBeDeleted: true,
    });
  }

  /**
   * Update role details (only non-system fields)
   */
  update(displayName?: string, description?: string): void {
    if (displayName !== undefined) {
      this.displayName = displayName;
    }
    if (description !== undefined) {
      this.description = description;
    }
    this.updatedAt = new Date();
  }

  /**
   * Validate if role can be deleted
   */
  validateDeletion(): void {
    if (!this.canBeDeleted) {
      throw new Error(`Role ${this.name} cannot be deleted (system role)`);
    }
    if (this.isSystem) {
      throw new Error(`System role ${this.name} cannot be deleted`);
    }
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getDisplayName(): string {
    return this.displayName;
  }

  getDescription(): string {
    return this.description;
  }

  getIsSystem(): boolean {
    return this.isSystem;
  }

  getCanBeDeleted(): boolean {
    return this.canBeDeleted;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      isSystem: this.isSystem,
      canBeDeleted: this.canBeDeleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
