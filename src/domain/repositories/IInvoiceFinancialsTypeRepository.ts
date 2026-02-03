import type { InvoiceFinancialsType } from '../entities/InvoiceFinancialsType.js';

export interface IInvoiceFinancialsTypeRepository {
  /** Types visible to tenant: system (tenant_id null) + tenant's own. If tenantId is null, returns only system types. */
  findAll(tenantId: string | null): Promise<InvoiceFinancialsType[]>;
  findById(id: string, tenantId: string): Promise<InvoiceFinancialsType | null>;
  findByIdAny(id: string): Promise<InvoiceFinancialsType | null>;
  findSystemByName(name: string): Promise<InvoiceFinancialsType | null>;
  findByName(tenantId: string, name: string): Promise<InvoiceFinancialsType | null>;
  save(type: InvoiceFinancialsType): Promise<InvoiceFinancialsType>;
  /** When tenantId is null, deletes system type (id must match). */
  delete(id: string, tenantId: string | null): Promise<void>;
}
