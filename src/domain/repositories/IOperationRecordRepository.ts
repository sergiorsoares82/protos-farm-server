import type { OperationRecord } from '../entities/OperationRecord.js';

export interface IOperationRecordRepository {
  findAll(tenantId: string): Promise<OperationRecord[]>;
  findById(id: string, tenantId: string): Promise<OperationRecord | null>;
  save(operationRecord: OperationRecord): Promise<OperationRecord>;
  delete(id: string, tenantId: string): Promise<void>;
}
