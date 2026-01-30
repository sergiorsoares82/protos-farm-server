import type { Request, Response } from 'express';
import { AppDataSource } from '../../infrastructure/database/typeorm.config.js';
import { SupplierEntity } from '../../infrastructure/database/entities/SupplierEntity.js';

/**
 * List suppliers for the tenant (for dropdowns e.g. invoice form).
 * Returns supplier id, personId, companyName, taxId and person name.
 */
export async function listSuppliers(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.tenant!.tenantId;
    const repo = AppDataSource.getRepository(SupplierEntity);
    const suppliers = await repo.find({
      where: { tenantId },
      relations: ['person'],
      order: { companyName: 'ASC' },
    });
    const data = suppliers.map((s) => ({
      id: s.id,
      personId: s.personId,
      companyName: s.companyName,
      taxId: s.taxId,
      supplyCategories: s.supplyCategories,
      paymentTerms: s.paymentTerms,
      person: s.person
        ? {
            id: s.person.id,
            firstName: s.person.firstName,
            lastName: s.person.lastName,
            fullName: `${s.person.firstName} ${s.person.lastName}`,
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
