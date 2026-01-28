import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    // Check if user exists
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // TODO: Add check to prevent deleting the last admin user in an organization
    
    // Delete user
    await this.userRepository.delete(userId);
  }
}
