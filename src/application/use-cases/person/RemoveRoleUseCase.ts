import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import { PersonRole } from '../../../domain/enums/PersonRole.js';
import type { PersonResponseDTO } from '../../dtos/PersonDTOs.js';

export class RemoveRoleUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(personId: string, role: PersonRole): Promise<PersonResponseDTO> {
    // Get person
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    // Check if person has this role
    if (!person.hasRole(role)) {
      throw new Error(`Person does not have role: ${role}`);
    }

    // Business rule: cannot remove last role
    if (person.getRoles().length === 1) {
      throw new Error('Cannot remove last role. Person must have at least one role.');
    }

    // Remove role
    await this.personRepository.removeRole(personId, role);

    // Reload person
    const updatedPerson = await this.personRepository.findById(personId);
    if (!updatedPerson) {
      throw new Error('Failed to reload person after role removal');
    }

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
