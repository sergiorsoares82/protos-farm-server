import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';

export class LinkPersonToUserUseCase {
  constructor(
    private personRepository: IPersonRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(personId: string, userId: string, tenantId: string): Promise<void> {
    // Check if user already has a person linked
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    if (user.getPersonId()) {
      throw new Error('User already has a person linked. Unlink first.');
    }

    // Check if person is already linked to another user
    const person = await this.personRepository.findById(personId, tenantId);
    if (!person) {
      throw new Error('Person not found');
    }

    if (person.getUserId()) {
      throw new Error('Person is already linked to a user');
    }

    person.linkToUser(userId);
    await this.personRepository.save(person, tenantId);
  }
}
