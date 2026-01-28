import type { Field } from '../entities/Field.js';

export interface IFieldRepository {
  findAll(tenantId: string): Promise<Field[]>;
  findById(id: string, tenantId: string): Promise<Field | null>;
  findByCode(code: string, tenantId: string): Promise<Field | null>;
  save(field: Field): Promise<Field>;
  delete(id: string, tenantId: string): Promise<void>;
}

