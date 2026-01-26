import { Email } from '../value-objects/Email.js';
import { Password } from '../value-objects/Password.js';

export interface UserProps {
  id: string;
  email: Email;
  password: Password;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private readonly id: string;
  private email: Email;
  private password: Password;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new user
   */
  static async create(email: string, plainPassword: string): Promise<User> {
    const emailVO = new Email(email);
    const passwordVO = await Password.create(plainPassword);
    const now = new Date();

    return new User({
      id: crypto.randomUUID(),
      email: emailVO,
      password: passwordVO,
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

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
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
      email: this.email.getValue(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
