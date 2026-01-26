import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { JWTService } from '../services/JWTService.js';
import type { LoginRequestDTO, LoginResponseDTO } from '../dtos/AuthDTOs.js';

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JWTService
  ) {}

  async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Validate password using domain logic
    const isPasswordValid = await user.validateCredentials(request.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT tokens
    const tokenPair = this.jwtService.generateTokenPair({
      userId: user.getId(),
      email: user.getEmail().getValue(),
    });

    // Return response
    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      user: {
        id: user.getId(),
        email: user.getEmail().getValue(),
      },
    };
  }
}
