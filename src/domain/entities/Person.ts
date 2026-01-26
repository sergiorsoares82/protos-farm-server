import { PersonRole } from '../enums/PersonRole.js';
import { Client, type ClientProps } from '../value-objects/roles/Client.js';
import { Supplier, type SupplierProps } from '../value-objects/roles/Supplier.js';
import { Worker, type WorkerProps } from '../value-objects/roles/Worker.js';
import { FarmOwner, type FarmOwnerProps } from '../value-objects/roles/FarmOwner.js';

export interface PersonProps {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: Map<PersonRole, Client | Supplier | Worker | FarmOwner>;
  createdAt: Date;
  updatedAt: Date;
}

export class Person {
  private readonly id: string;
  private userId?: string;
  private firstName: string;
  private lastName: string;
  private email: string;
  private phone?: string;
  private roles: Map<PersonRole, Client | Supplier | Worker | FarmOwner>;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: PersonProps) {
    this.validateProps(props);
    this.id = props.id;
    if (props.userId) this.userId = props.userId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    if (props.phone) this.phone = props.phone;
    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new person
   */
  static create(
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    userId?: string
  ): Person {
    const now = new Date();
    return new Person({
      id: crypto.randomUUID(),
      ...(userId && { userId }),
      firstName,
      lastName,
      email,
      ...(phone && { phone }),
      roles: new Map(),
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: PersonProps): void {
    if (!props.firstName || props.firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!props.lastName || props.lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (!props.email || props.email.trim().length === 0) {
      throw new Error('Email is required');
    }
    // Business rule: at least one role required
    if (props.roles.size === 0) {
      throw new Error('Person must have at least one role');
    }
  }

  /**
   * Assign a role to the person
   */
  assignRole(role: PersonRole, roleData: Client | Supplier | Worker | FarmOwner): void {
    if (this.roles.has(role)) {
      throw new Error(`Person already has role: ${role}`);
    }
    this.roles.set(role, roleData);
    this.updatedAt = new Date();
  }

  /**
   * Remove a role from the person
   */
  removeRole(role: PersonRole): void {
    if (!this.roles.has(role)) {
      throw new Error(`Person does not have role: ${role}`);
    }
    // Business rule: must have at least one role
    if (this.roles.size === 1) {
      throw new Error('Cannot remove last role. Person must have at least one role.');
    }
    this.roles.delete(role);
    this.updatedAt = new Date();
  }

  /**
   * Check if person has a specific role
   */
  hasRole(role: PersonRole): boolean {
    return this.roles.has(role);
  }

  /**
   * Get role data for a specific role
   */
  getRole<T extends Client | Supplier | Worker | FarmOwner>(role: PersonRole): T | undefined {
    return this.roles.get(role) as T | undefined;
  }

  /**
   * Get all roles
   */
  getRoles(): PersonRole[] {
    return Array.from(this.roles.keys());
  }

  /**
   * Update basic person information
   */
  updateInfo(firstName: string, lastName: string, email: string, phone?: string): void {
    if (!firstName || firstName.trim().length === 0) {
      throw new Error('First name is required');
    }
    if (!lastName || lastName.trim().length === 0) {
      throw new Error('Last name is required');
    }
    if (!email || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    if (phone) {
      this.phone = phone;
    } else {
      delete this.phone;
    }
    this.updatedAt = new Date();
  }

  /**
   * Link person to a user account
   */
  linkToUser(userId: string): void {
    if (this.userId) {
      throw new Error('Person is already linked to a user');
    }
    this.userId = userId;
    this.updatedAt = new Date();
  }

  /**
   * Get full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getEmail(): string {
    return this.email;
  }

  getPhone(): string | undefined {
    return this.phone;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Serialization
  toJSON() {
    const rolesObj: Record<string, any> = {};
    this.roles.forEach((roleData, role) => {
      rolesObj[role] = roleData.toJSON();
    });

    return {
      id: this.id,
      userId: this.userId,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      roles: rolesObj,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
