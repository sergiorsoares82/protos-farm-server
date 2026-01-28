import { UserRole } from '../../domain/enums/UserRole.js';

export interface UserPersonDTO {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
}

export interface UserResponseDTO {
  id: string;
  email: string;
  role: UserRole;
  tenantId: string;
  organizationName?: string;
  person?: UserPersonDTO | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequestDTO {
  email: string;
  password: string;
  role: UserRole;
  tenantId: string;
  personId?: string; // Optional: link to existing person during creation
}

export interface UpdateUserRequestDTO {
  email?: string;
  role?: UserRole;
  password?: string;
}

export interface LinkPersonToUserRequestDTO {
  personId: string;
}
