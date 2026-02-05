import type { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';
import { ClientEntity } from '../../infrastructure/database/entities/ClientEntity.js';

/**
 * List clients for the tenant (for dropdowns e.g. invoice recipient in RECEITA).
 * Returns client id, personId and person (nome, cpfCnpj, email).
 */
export async function listClients(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenant!.tenantId;
    const repo = AppDataSource.getRepository(ClientEntity);
    const clients = await repo.find({
      where: { tenantId },
      relations: ['person'],
      order: { id: 'ASC' },
    });
    const data = clients.map((c) => ({
      id: c.id,
      personId: c.personId,
      person: c.person
        ? {
            id: c.person.id,
            nome: c.person.nome,
            personType: c.person.personType,
            cpfCnpj: c.person.cpfCnpj,
            email: c.person.email,
          }
        : null,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('List clients error:', error);
    const message = error instanceof Error ? error.message : 'Falha ao listar clientes';
    res.status(400).json({ success: false, error: message });
  }
}
