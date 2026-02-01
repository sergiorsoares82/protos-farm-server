/**
 * Client Role Value Object
 * Represents client-specific data (only client_categories for now)
 */
export interface ClientProps {
  clientCategories?: string;
}

export class Client {
  private readonly clientCategories?: string;

  constructor(props: ClientProps) {
    if (props.clientCategories) this.clientCategories = props.clientCategories;
  }

  getClientCategories(): string | undefined {
    return this.clientCategories;
  }

  toJSON(): ClientProps {
    return {
      ...(this.clientCategories && { clientCategories: this.clientCategories }),
    };
  }
}
