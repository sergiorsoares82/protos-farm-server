import { EntityType } from '../enums/EntityType.js';
import { PermissionAction } from '../enums/PermissionAction.js';

export interface PermissionProps {
  id: string;
  entity: EntityType;
  action: PermissionAction;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Permission {
  private readonly id: string;
  private readonly entity: EntityType;
  private readonly action: PermissionAction;
  private description: string;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: PermissionProps) {
    this.id = props.id;
    this.entity = props.entity;
    this.action = props.action;
    this.description = props.description;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new permission
   */
  static create(
    entity: EntityType,
    action: PermissionAction,
    description?: string
  ): Permission {
    const now = new Date();
    const defaultDescription = `${action} permission for ${entity}`;

    return new Permission({
      id: crypto.randomUUID(),
      entity,
      action,
      description: description || defaultDescription,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Get permission key in format "ENTITY:ACTION"
   */
  getKey(): string {
    return `${this.entity}:${this.action}`;
  }

  /**
   * Update permission description
   */
  updateDescription(newDescription: string): void {
    this.description = newDescription;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getEntity(): EntityType {
    return this.entity;
  }

  getAction(): PermissionAction {
    return this.action;
  }

  getDescription(): string {
    return this.description;
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
      entity: this.entity,
      action: this.action,
      description: this.description,
      key: this.getKey(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
