export interface OperationRecordWorkerDTO {
  workerId: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface OperationRecordProductDTO {
  productId: string;
  quantity: number;
  unitOfMeasureId: string;
}

export interface CreateOperationRecordDTO {
  serviceDate: string; // ISO date string
  seasonId?: string;
  operationId: string;
  machineId: string;
  horimeterStart: number;
  horimeterEnd: number;
  implementId?: string;
  fieldId: string;
  costCenterId: string;
  notes?: string;
  workers: OperationRecordWorkerDTO[];
  products: OperationRecordProductDTO[];
}

export interface UpdateOperationRecordDTO {
  serviceDate?: string; // ISO date string
  seasonId?: string;
  operationId?: string;
  machineId?: string;
  horimeterStart?: number;
  horimeterEnd?: number;
  implementId?: string | null;
  fieldId?: string;
  costCenterId?: string;
  notes?: string | null;
  workers?: OperationRecordWorkerDTO[];
  products?: OperationRecordProductDTO[];
  isActive?: boolean;
}
