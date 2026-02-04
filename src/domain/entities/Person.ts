import { PersonRole } from '../enums/PersonRole.js';
import { PersonType } from '../enums/PersonType.js';
import { Client, type ClientProps } from '../value-objects/roles/Client.js';
import { Supplier, type SupplierProps } from '../value-objects/roles/Supplier.js';
import { Worker, type WorkerProps } from '../value-objects/roles/Worker.js';
import { FarmOwner, type FarmOwnerProps } from '../value-objects/roles/FarmOwner.js';

export interface PersonProps {
  id: string;
  userId?: string;
  nome: string;
  personType: PersonType;
  cpfCnpj?: string;
  // E-mail opcional (por exemplo, para proprietários sem e-mail)
  email?: string;
  phone?: string;
  roles: Map<PersonRole, Client | Supplier | Worker | FarmOwner>;
  createdAt: Date;
  updatedAt: Date;
}

export class Person {
  private readonly id: string;
  private userId?: string;
  private nome: string;
  private personType: PersonType;
  private cpfCnpj?: string;
  private email?: string;
  private phone?: string;
  private roles: Map<PersonRole, Client | Supplier | Worker | FarmOwner>;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: PersonProps) {
    this.validateProps(props);
    this.id = props.id;
    if (props.userId) this.userId = props.userId;
    this.nome = props.nome;
    this.personType = props.personType;
    if (props.cpfCnpj) this.cpfCnpj = props.cpfCnpj;
    if (props.email) this.email = props.email;
    if (props.phone) this.phone = props.phone;
    this.roles = props.roles;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  /**
   * Factory method to create a new person
   */
  static create(
    nome: string,
    email: string | undefined,
    personType: PersonType,
    phone?: string,
    userId?: string,
    cpfCnpj?: string
  ): Person {
    const now = new Date();
    return new Person({
      id: crypto.randomUUID(),
      ...(userId && { userId }),
      nome,
      personType,
      ...(cpfCnpj && { cpfCnpj }),
      ...(email && { email }),
      ...(phone && { phone }),
      roles: new Map(),
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: PersonProps): void {
    if (!props.nome || props.nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
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
    if (this.roles.size === 1) {
      throw new Error('Cannot remove last role. Person must have at least one role.');
    }
    this.roles.delete(role);
    this.updatedAt = new Date();
  }

  hasRole(role: PersonRole): boolean {
    return this.roles.has(role);
  }

  getRole<T extends Client | Supplier | Worker | FarmOwner>(role: PersonRole): T | undefined {
    return this.roles.get(role) as T | undefined;
  }

  getRoles(): PersonRole[] {
    return Array.from(this.roles.keys());
  }

  /**
   * Update basic person information
   */
  updateInfo(nome: string, email?: string, phone?: string, personType?: PersonType, cpfCnpj?: string): void {
    if (!nome || nome.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }
    this.nome = nome;
    // Se email foi explicitamente enviado, validar e atualizar;
    // caso contrário, manter o valor atual (inclusive podendo continuar sem e-mail).
    if (email !== undefined) {
      if (!email.trim()) {
        throw new Error('Email não pode ser vazio se informado');
      }
      this.email = email;
    }
    if (personType !== undefined) this.personType = personType;
    if (cpfCnpj !== undefined) {
      if (cpfCnpj) this.cpfCnpj = cpfCnpj;
      else delete this.cpfCnpj;
    }
    if (phone) {
      this.phone = phone;
    } else {
      delete this.phone;
    }
    this.updatedAt = new Date();
  }

  linkToUser(userId: string): void {
    if (this.userId) {
      throw new Error('Person is already linked to a user');
    }
    this.userId = userId;
    this.updatedAt = new Date();
  }

  unlinkFromUser(): void {
    if (!this.userId) {
      throw new Error('Person is not linked to any user');
    }
    delete this.userId;
    this.updatedAt = new Date();
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string | undefined {
    return this.userId;
  }

  getNome(): string {
    return this.nome;
  }

  getPersonType(): PersonType {
    return this.personType;
  }

  getCpfCnpj(): string | undefined {
    return this.cpfCnpj;
  }

  getEmail(): string {
    return this.email as string;
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

  toJSON() {
    const rolesObj: Record<string, any> = {};
    this.roles.forEach((roleData, role) => {
      rolesObj[role] = roleData.toJSON();
    });
    return {
      id: this.id,
      userId: this.userId,
      nome: this.nome,
      personType: this.personType,
      cpfCnpj: this.cpfCnpj,
      email: this.email,
      phone: this.phone,
      roles: rolesObj,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
