import bcrypt from 'bcryptjs';

export class Password {
  private readonly hashedValue: string;

  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Create a Password from plain text (for new passwords)
   */
  static async create(plainPassword: string): Promise<Password> {
    this.validateStrength(plainPassword);
    const hashedValue = await bcrypt.hash(plainPassword, 10);
    return new Password(hashedValue);
  }

  /**
   * Create a Password from an already hashed value (for loading from DB)
   */
  static fromHash(hashedValue: string): Password {
    if (!hashedValue || hashedValue.trim().length === 0) {
      throw new Error('Hashed password cannot be empty');
    }
    return new Password(hashedValue);
  }

  private static validateStrength(plainPassword: string): void {
    if (!plainPassword || plainPassword.length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (plainPassword.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (plainPassword.length > 128) {
      throw new Error('Password is too long');
    }

    const hasUpperCase = /[A-Z]/.test(plainPassword);
    const hasLowerCase = /[a-z]/.test(plainPassword);
    const hasNumber = /[0-9]/.test(plainPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(plainPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      throw new Error(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      );
    }
  }

  /**
   * Compare a plain text password with the hashed password
   */
  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHashedValue(): string {
    return this.hashedValue;
  }
}
