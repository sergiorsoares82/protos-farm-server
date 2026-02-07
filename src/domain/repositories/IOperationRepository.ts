import { Operation } from '../entities/Operation.js';

export interface IOperationRepository {
    findAll(tenantId: string): Promise<Operation[]>;
    findById(id: string, tenantId: string): Promise<Operation | null>;
    findByCode(code: string, tenantId: string): Promise<Operation | null>;
    save(operation: Operation): Promise<Operation>;
    delete(id: string, tenantId: string): Promise<void>;
}
