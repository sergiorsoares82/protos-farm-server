export interface DocumentTypeProps {
  id?: string | undefined;
  name: string;
  group: string;
  hasAccessKey: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class DocumentType {
  private id?: string | undefined;
  private name: string;
  private group: string;
  private hasAccessKey: boolean;
  private createdAt?: Date;
  private updatedAt?: Date;

  constructor(props: DocumentTypeProps) {
    this.id = props.id;
    this.name = props.name;
    this.group = props.group;
    this.hasAccessKey = props.hasAccessKey;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  getId(): string | undefined {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
    this.touch();
  }

  getGroup(): string {
    return this.group;
  }

  setGroup(group: string): void {
    this.group = group;
    this.touch();
  }

  getHasAccessKey(): boolean {
    return this.hasAccessKey;
  }

  setHasAccessKey(hasAccessKey: boolean): void {
    this.hasAccessKey = hasAccessKey;
    this.touch();
  }

  getCreatedAt(): Date | undefined {
    return this.createdAt;
  }

  getUpdatedAt(): Date | undefined {
    return this.updatedAt;
  }

  private touch(): void {
    this.updatedAt = new Date();
  }
}

