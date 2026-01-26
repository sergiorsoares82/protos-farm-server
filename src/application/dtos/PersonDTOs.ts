import { PersonRole } from '../../domain/enums/PersonRole.js';
import type { ClientProps } from '../../domain/value-objects/roles/Client.js';
import type { SupplierProps } from '../../domain/value-objects/roles/Supplier.js';
import type { WorkerProps } from '../../domain/value-objects/roles/Worker.js';
import type { FarmOwnerProps } from '../../domain/value-objects/roles/FarmOwner.js';

/**
 * Role data for creating/updating a person
 */
export type RoleDataDTO = ClientProps | SupplierProps | WorkerProps | FarmOwnerProps;

export interface RoleAssignmentDTO {
  type: PersonRole;
  data: RoleDataDTO;
}

/**
 * Request to create a person
 */
export interface CreatePersonRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userId?: string;
  roles: RoleAssignmentDTO[];
}

/**
 * Request to update person basic info
 */
export interface UpdatePersonRequestDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

/**
 * Request to assign a role to a person
 */
export interface AssignRoleRequestDTO {
  role: PersonRole;
  roleData: RoleDataDTO;
}

/**
 * Response for person operations
 */
export interface PersonResponseDTO {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  roles: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * List of persons response
 */
export interface PersonListResponseDTO {
  persons: PersonResponseDTO[];
  total: number;
}
