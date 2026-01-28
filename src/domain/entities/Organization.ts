export interface OrganizationProps {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Organization {
  private readonly id: string;
  private name: string;
  private slug: string;
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: OrganizationProps) {
    this.id = props.id;
    this.name = props.name;
    this.slug = props.slug;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    
    this.validate();
  }

  /**
   * Factory method to create a new organization
   */
  static create(name: string, slug: string): Organization {
    const now = new Date();
    
    return new Organization({
      id: crypto.randomUUID(),
      name,
      slug,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validate(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Organization name is required');
    }
    
    if (!this.slug || this.slug.trim().length === 0) {
      throw new Error('Organization slug is required');
    }
    
    // Slug validation: lowercase, alphanumeric with hyphens
    if (!/^[a-z0-9-]+$/.test(this.slug)) {
      throw new Error('Organization slug must be lowercase alphanumeric with hyphens');
    }
  }

  /**
   * Update organization details
   */
  updateDetails(name: string, slug: string): void {
    this.name = name;
    this.slug = slug;
    this.updatedAt = new Date();
    this.validate();
  }

  /**
   * Activate organization
   */
  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  /**
   * Deactivate organization
   */
  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getSlug(): string {
    return this.slug;
  }

  getIsActive(): boolean {
    return this.isActive;
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
      name: this.name,
      slug: this.slug,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
