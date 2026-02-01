import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';
import type { PersonResponseDTO } from '../../dtos/PersonDTOs.js';

export class GetPersonUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async executeAll(tenantId: string): Promise<PersonResponseDTO[]> {
    const persons = await this.personRepository.findAll(tenantId);

    return persons.map((person) => {
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
    });
  }

  async execute(personId: string, tenantId: string): Promise<PersonResponseDTO> {
    const person = await this.personRepository.findById(personId, tenantId);

    if (!person) {
      throw new Error('Person not found');
    }

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

  async executeByEmail(email: string, tenantId: string): Promise<PersonResponseDTO> {
    const person = await this.personRepository.findByEmail(email, tenantId);

    if (!person) {
      throw new Error('Person not found');
    }

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
