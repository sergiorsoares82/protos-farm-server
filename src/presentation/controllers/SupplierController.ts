import type { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';
import { SupplierEntity } from '../../infrastructure/database/entities/SupplierEntity.js';

/**
 * List suppliers for the tenant (for dropdowns e.g. invoice form).
 * Returns supplier id, personId, supplyCategories and person (nome, cpfCnpj, email).
 */
export async function listSuppliers(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenant!.tenantId;
    const repo = AppDataSource.getRepository(SupplierEntity);
    const suppliers = await repo.find({
      where: { tenantId },
      relations: ['person'],
      order: { id: 'ASC' },
    });
    const data = suppliers.map((s) => ({
      id: s.id,
      personId: s.personId,
      supplyCategories: s.supplyCategories,
      person: s.person
        ? {
            id: s.person.id,
            nome: s.person.nome,
            personType: s.person.personType,
            cpfCnpj: s.person.cpfCnpj,
            email: s.person.email,
          }
        : null,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('List suppliers error:', error);
    const message = error instanceof Error ? error.message : 'Falha ao listar fornecedores';
    res.status(400).json({ success: false, error: message });
  }
}
