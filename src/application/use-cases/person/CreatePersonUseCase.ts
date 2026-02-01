import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import { Person } from '../../../domain/entities/Person.js';
import type { CreatePersonRequestDTO, PersonResponseDTO } from '../../dtos/PersonDTOs.js';
import { Client } from '../../../domain/value-objects/roles/Client.js';
import { Supplier } from '../../../domain/value-objects/roles/Supplier.js';
import { Worker } from '../../../domain/value-objects/roles/Worker.js';
import { FarmOwner } from '../../../domain/value-objects/roles/FarmOwner.js';
import { PersonRole } from '../../../domain/enums/PersonRole.js';

export class CreatePersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(request: CreatePersonRequestDTO, tenantId: string): Promise<PersonResponseDTO> {
    // Check if email already exists within tenant
    const existingPerson = await this.personRepository.findByEmail(request.email, tenantId);
    if (existingPerson) {
      throw new Error('Email already in use');
    }

    // Validate at least one role
    if (!request.roles || request.roles.length === 0) {
      throw new Error('Person must have at least one role');
    }

    // Create person
    const person = Person.create(
      request.nome,
      request.email,
      request.personType,
      request.phone,
      request.userId,
      request.cpfCnpj
    );

    // Assign roles
    for (const roleAssignment of request.roles) {
      const roleData = this.createRoleValueObject(roleAssignment.type, roleAssignment.data);
      person.assignRole(roleAssignment.type, roleData);
    }

    // Save person with tenant context
    const savedPerson = await this.personRepository.save(person, tenantId);

    return this.toDTO(savedPerson);
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

  private toDTO(person: Person): PersonResponseDTO {
    const userId = person.getUserId();
    const phone = person.getPhone();

    return {
      id: person.getId(),
      ...(userId && { userId }),
      nome: person.getNome(),
      personType: person.getPersonType(),
      ...(person.getCpfCnpj() && { cpfCnpj: person.getCpfCnpj() }),
      email: person.getEmail(),
      ...(phone && { phone }),
      roles: person.toJSON().roles,
      createdAt: person.getCreatedAt(),
      updatedAt: person.getUpdatedAt(),
    };
  }
}
