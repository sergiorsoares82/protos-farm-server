import { UserRole } from '../../domain/enums/UserRole.js';

// Login DTOs
export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
    tenantId: string;
  };
}

// Refresh Token DTOs
export interface RefreshTokenRequestDTO {
  refreshToken: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  refreshToken: string;
}

// Error response DTO
export interface ErrorResponseDTO {
  error: string;
  message: string;
  statusCode: number;
}
