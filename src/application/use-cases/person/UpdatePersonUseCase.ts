import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import type { UpdatePersonRequestDTO, PersonResponseDTO } from '../../dtos/PersonDTOs.js';

export class UpdatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(personId: string, request: UpdatePersonRequestDTO): Promise<PersonResponseDTO> {
    // Get person
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    // Check if email is being changed and if it's already taken
    if (request.email && request.email !== person.getEmail()) {
      const emailTaken = await this.personRepository.existsByEmail(request.email);
      if (emailTaken) {
        throw new Error('Email already in use');
      }
    }

    // Update person info
    person.updateInfo(
      request.firstName || person.getFirstName(),
      request.lastName || person.getLastName(),
      request.email || person.getEmail(),
      request.phone !== undefined ? request.phone : person.getPhone()
    );

    // Save updated person
    const updatedPerson = await this.personRepository.save(person);

    const userId = updatedPerson.getUserId();
    const phone = updatedPerson.getPhone();

    return {
      id: updatedPerson.getId(),
      ...(userId && { userId }),
      firstName: updatedPerson.getFirstName(),
      lastName: updatedPerson.getLastName(),
      fullName: updatedPerson.getFullName(),
      email: updatedPerson.getEmail(),
      ...(phone && { phone }),
      roles: updatedPerson.toJSON().roles,
      createdAt: updatedPerson.getCreatedAt(),
      updatedAt: updatedPerson.getUpdatedAt(),
    };
  }
}
