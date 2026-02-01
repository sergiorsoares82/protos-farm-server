import { PersonRole } from '../../domain/enums/PersonRole.js';
import { PersonType } from '../../domain/enums/PersonType.js';
import type { ClientProps } from '../../domain/value-objects/roles/Client.js';
import type { SupplierProps } from '../../domain/value-objects/roles/Supplier.js';
import type { WorkerProps } from '../../domain/value-objects/roles/Worker.js';
import type { FarmOwnerProps } from '../../domain/value-objects/roles/FarmOwner.js';

export type RoleDataDTO = ClientProps | SupplierProps | WorkerProps | FarmOwnerProps;

export interface RoleAssignmentDTO {
  type: PersonRole;
  data: RoleDataDTO;
}

export interface CreatePersonRequestDTO {
  nome: string;
  personType: PersonType;
  cpfCnpj?: string;
  email: string;
  phone?: string;
  userId?: string;
  roles: RoleAssignmentDTO[];
}

export interface UpdatePersonRequestDTO {
  nome?: string;
  personType?: PersonType;
  cpfCnpj?: string | null;
  email?: string;
  phone?: string;
}

export interface AssignRoleRequestDTO {
  role: PersonRole;
  roleData: RoleDataDTO;
}

export interface PersonResponseDTO {
  id: string;
  userId?: string;
  nome: string;
  personType: PersonType;
  cpfCnpj?: string | undefined;
  email: string;
  phone?: string;
  roles: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface PersonListResponseDTO {
  persons: PersonResponseDTO[];
  total: number;
}
