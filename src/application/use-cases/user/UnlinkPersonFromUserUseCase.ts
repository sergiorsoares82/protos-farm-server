import type { IPersonRepository } from '../../../domain/repositories/IPersonRepository.js';

export class UnlinkPersonFromUserUseCase {
  constructor(private personRepository: IPersonRepository) {}

  async execute(personId: string, tenantId: string): Promise<void> {
    const person = await this.personRepository.findById(personId, tenantId);
    
    if (!person) {
      throw new Error('Person not found');
    }

    person.unlinkFromUser();
    await this.personRepository.save(person, tenantId);
  }
}
