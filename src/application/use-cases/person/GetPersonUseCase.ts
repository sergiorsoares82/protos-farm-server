import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import type { PersonResponseDTO } from '../../dtos/PersonDTOs.js';

export class GetPersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(personId: string): Promise<PersonResponseDTO> {
    const person = await this.personRepository.findById(personId);

    if (!person) {
      throw new Error('Person not found');
    }

    const userId = person.getUserId();
    const phone = person.getPhone();

    return {
      id: person.getId(),
      ...(userId && { userId }),
      firstName: person.getFirstName(),
      lastName: person.getLastName(),
      fullName: person.getFullName(),
      email: person.getEmail(),
      ...(phone && { phone }),
      roles: person.toJSON().roles,
      createdAt: person.getCreatedAt(),
      updatedAt: person.getUpdatedAt(),
    };
  }

  async executeByEmail(email: string): Promise<PersonResponseDTO> {
    const person = await this.personRepository.findByEmail(email);

    if (!person) {
      throw new Error('Person not found');
    }

    const userId = person.getUserId();
    const phone = person.getPhone();

    return {
      id: person.getId(),
      ...(userId && { userId }),
      firstName: person.getFirstName(),
      lastName: person.getLastName(),
      fullName: person.getFullName(),
      email: person.getEmail(),
      ...(phone && { phone }),
      roles: person.toJSON().roles,
      createdAt: person.getCreatedAt(),
      updatedAt: person.getUpdatedAt(),
    };
  }
}
