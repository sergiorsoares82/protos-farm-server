import { JWTService } from '../services/JWTService.js';
import type { RefreshTokenRequestDTO, RefreshTokenResponseDTO } from '../dtos/AuthDTOs.js';

export class RefreshTokenUseCase {
  constructor(private readonly jwtService: JWTService) {}

  async execute(request: RefreshTokenRequestDTO): Promise<RefreshTokenResponseDTO> {
    // Verify the refresh token
    const payload = this.jwtService.verifyRefreshToken(request.refreshToken);

    // Generate new token pair with tenant ID and role
    const tokenPair = this.jwtService.generateTokenPair({
      userId: payload.userId,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    });

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }
}
