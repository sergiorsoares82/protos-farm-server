import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import type { AssignRoleRequestDTO, PersonResponseDTO } from '../../dtos/PersonDTOs.js';
import { Client } from '../../../domain/value-objects/roles/Client.js';
import { Supplier } from '../../../domain/value-objects/roles/Supplier.js';
import { Worker } from '../../../domain/value-objects/roles/Worker.js';
import { FarmOwner } from '../../../domain/value-objects/roles/FarmOwner.js';
import { PersonRole } from '../../../domain/enums/PersonRole.js';

export class AssignRoleUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(personId: string, request: AssignRoleRequestDTO): Promise<PersonResponseDTO> {
    // Get person
    const person = await this.personRepository.findById(personId);
    if (!person) {
      throw new Error('Person not found');
    }

    // Check if person already has this role
    if (person.hasRole(request.role)) {
      throw new Error(`Person already has role: ${request.role}`);
    }

    // Create role value object
    const roleData = this.createRoleValueObject(request.role, request.roleData);

    // Assign role through repository (and domain entity)
    person.assignRole(request.role, roleData);
    await this.personRepository.assignRole(personId, request.role, roleData);

    // Reload person with new role
    const updatedPerson = await this.personRepository.findById(personId);
    if (!updatedPerson) {
      throw new Error('Failed to reload person after role assignment');
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

  private createRoleValueObject(
    role: PersonRole,
    data: any
  ): Client | Supplier | Worker | FarmOwner {
    switch (role) {
      case PersonRole.CLIENT:
        return new Client(data);
      case PersonRole.SUPPLIER:
        return new Supplier(data);
      case PersonRole.WORKER:
        // Convert hireDate string to Date if needed
        if (typeof data.hireDate === 'string') {
          data.hireDate = new Date(data.hireDate);
        }
        return new Worker(data);
      case PersonRole.FARM_OWNER:
        return new FarmOwner(data);
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  }
}
