import { Operation } from '../../domain/entities/Operation.js';
import type { IOperationRepository } from '../../domain/repositories/IOperationRepository.js';
import type { CreateOperationDTO, UpdateOperationDTO } from '../dtos/OperationDTOs.js';

export class OperationService {
    constructor(private readonly operationRepository: IOperationRepository) {}

    private validateCode(code: string): void {
        const codePattern = /^\d+(\.\d+)*$/;
        if (!codePattern.test(code)) {
            throw new Error('Invalid code format. Use numbers separated by dots (e.g. 1, 1.1, 1.2.01).');
        }
    }

    async createOperation(tenantId: string, data: CreateOperationDTO): Promise<Operation> {
        this.validateCode(data.code);

        const existing = await this.operationRepository.findByCode(data.code, tenantId);
        if (existing) {
            throw new Error(`Operation with code '${data.code}' already exists`);
        }

        if (data.code.includes('.')) {
            const parts = data.code.split('.');
            parts.pop();
            const parentCode = parts.join('.');
            const parent = await this.operationRepository.findByCode(parentCode, tenantId);
            if (!parent) {
                throw new Error(`Parent operation '${parentCode}' does not exist. Please create it first.`);
            }
        }

        const operation = Operation.create(
            tenantId,
            data.code,
            data.description,
            data.activityTypeIds ?? [],
        );
        return this.operationRepository.save(operation);
    }

    async getOperation(tenantId: string, id: string): Promise<Operation> {
        const operation = await this.operationRepository.findById(id, tenantId);
        if (!operation) {
            throw new Error('Operation not found');
        }
        return operation;
    }

    async updateOperation(tenantId: string, id: string, data: UpdateOperationDTO): Promise<Operation> {
        const operation = await this.getOperation(tenantId, id);

        if (data.code && data.code !== operation.getCode()) {
            this.validateCode(data.code);
            const existing = await this.operationRepository.findByCode(data.code, tenantId);
            if (existing) {
                throw new Error(`Operation with code '${data.code}' already exists`);
            }
            if (data.code.includes('.')) {
                const parts = data.code.split('.');
                parts.pop();
                const parentCode = parts.join('.');
                const parent = await this.operationRepository.findByCode(parentCode, tenantId);
                if (!parent) {
                    throw new Error(`Parent operation '${parentCode}' does not exist.`);
                }
            }
        }

        if (data.code !== undefined || data.description !== undefined || data.activityTypeIds !== undefined) {
            operation.update(
                data.code ?? operation.getCode(),
                data.description ?? operation.getDescription(),
                data.activityTypeIds !== undefined ? data.activityTypeIds : operation.getActivityTypeIds(),
            );
        }

        if (data.isActive !== undefined) {
            if (data.isActive) {
                operation.activate();
            } else {
                operation.deactivate();
            }
        }

        return this.operationRepository.save(operation);
    }

    async deleteOperation(tenantId: string, id: string): Promise<void> {
        await this.operationRepository.delete(id, tenantId);
    }

    async getAllOperations(tenantId: string): Promise<Operation[]> {
        return this.operationRepository.findAll(tenantId);
    }
}
