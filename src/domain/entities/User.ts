import { Email } from '../value-objects/Email.js';
import { Password } from '../value-objects/Password.js';
import { UserRole } from '../enums/UserRole.js';

export interface UserProps {
  id: string;
  tenantId: string;
  email: Email;
  password: Password;
  role: UserRole;
  personId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: string;
  private readonly tenantId: string;
  private email: Email;
  private password: Password;
  private role: UserRole;
  private personId?: string | undefined;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.personId = props.personId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new user
   */
  static async create(email: string, plainPassword: string, tenantId: string, role: UserRole = UserRole.USER): Promise<User> {
    const emailVO = new Email(email);
    const passwordVO = await Password.create(plainPassword);
    const now = new Date();

    return new User({
      id: crypto.randomUUID(),
      tenantId,
      email: emailVO,
      password: passwordVO,
      role,
      createdAt: now,
      updatedAt: now,
    });
  }

  /**
   * Validate user credentials for authentication
   */
  async validateCredentials(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }

  /**
   * Change user password
   */
  async changePassword(newPlainPassword: string): Promise<void> {
    this.password = await Password.create(newPlainPassword);
    this.updatedAt = new Date();
  }

  /**
   * Update email address
   */
  updateEmail(newEmail: string): void {
    this.email = new Email(newEmail);
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  getRole(): UserRole {
    return this.role;
  }

  getPersonId(): string | undefined {
    return this.personId;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Role helpers
  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  isOrgAdmin(): boolean {
    return this.role === UserRole.ORG_ADMIN;
  }

  isRegularUser(): boolean {
    return this.role === UserRole.USER;
  }

  // For serialization
  toJSON() {
    return {
      id: this.id,
      email: this.email.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
