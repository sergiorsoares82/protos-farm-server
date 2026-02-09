export interface OperationRecordWorkerProps {
  id: string;
  workerId: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface OperationRecordProductProps {
  id: string;
  productId: string;
  quantity: number;
  unitOfMeasureId: string;
}

export interface OperationRecordProps {
  id: string;
  tenantId: string;
  serviceDate: Date;
  seasonId?: string | null;
  operationId: string;
  machineId: string;
  horimeterStart: number;
  horimeterEnd: number;
  implementId?: string | null;
  fieldId: string;
  costCenterId: string;
  notes?: string | null;
  workers: OperationRecordWorkerProps[];
  products: OperationRecordProductProps[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OperationRecordWorker {
  private readonly id: string;
  private workerId: string;
  private startTime: string;
  private endTime: string;

  constructor(props: OperationRecordWorkerProps) {
    this.validateWorkerProps(props);
    this.id = props.id;
    this.workerId = props.workerId;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
  }

  static create(workerId: string, startTime: string, endTime: string): OperationRecordWorker {
    return new OperationRecordWorker({
      id: crypto.randomUUID(),
      workerId,
      startTime,
      endTime,
    });
  }

  private validateWorkerProps(props: OperationRecordWorkerProps): void {
    if (!props.workerId || props.workerId.trim().length === 0) {
      throw new Error('Worker ID is required');
    }
    if (!props.startTime || !this.isValidTimeFormat(props.startTime)) {
      throw new Error('Start time is required and must be in HH:MM format');
    }
    if (!props.endTime || !this.isValidTimeFormat(props.endTime)) {
      throw new Error('End time is required and must be in HH:MM format');
    }
    if (props.endTime <= props.startTime) {
      throw new Error('End time must be after start time');
    }
  }

  private isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  getId(): string {
    return this.id;
  }

  getWorkerId(): string {
    return this.workerId;
  }

  getStartTime(): string {
    return this.startTime;
  }

  getEndTime(): string {
    return this.endTime;
  }

  update(workerId: string, startTime: string, endTime: string): void {
    const tempProps = { id: this.id, workerId, startTime, endTime };
    this.validateWorkerProps(tempProps);
    this.workerId = workerId;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

export class OperationRecordProduct {
  private readonly id: string;
  private productId: string;
  private quantity: number;
  private unitOfMeasureId: string;

  constructor(props: OperationRecordProductProps) {
    this.validateProductProps(props);
    this.id = props.id;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.unitOfMeasureId = props.unitOfMeasureId;
  }

  static create(productId: string, quantity: number, unitOfMeasureId: string): OperationRecordProduct {
    return new OperationRecordProduct({
      id: crypto.randomUUID(),
      productId,
      quantity,
      unitOfMeasureId,
    });
  }

  private validateProductProps(props: OperationRecordProductProps): void {
    if (!props.productId || props.productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }
    if (!props.unitOfMeasureId || props.unitOfMeasureId.trim().length === 0) {
      throw new Error('Unit of measure ID is required');
    }
    if (props.quantity === undefined || props.quantity === null || props.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
  }

  getId(): string {
    return this.id;
  }

  getProductId(): string {
    return this.productId;
  }

  getQuantity(): number {
    return this.quantity;
  }

  getUnitOfMeasureId(): string {
    return this.unitOfMeasureId;
  }

  update(productId: string, quantity: number, unitOfMeasureId: string): void {
    const tempProps = { id: this.id, productId, quantity, unitOfMeasureId };
    this.validateProductProps(tempProps);
    this.productId = productId;
    this.quantity = quantity;
    this.unitOfMeasureId = unitOfMeasureId;
  }
}

export class OperationRecord {
  private readonly id: string;
  private readonly tenantId: string;
  private serviceDate: Date;
  private seasonId?: string | null;
  private operationId: string;
  private machineId: string;
  private horimeterStart: number;
  private horimeterEnd: number;
  private implementId?: string | null;
  private fieldId: string;
  private costCenterId: string;
  private notes?: string | null;
  private workers: OperationRecordWorker[];
  private products: OperationRecordProduct[];
  private isActive: boolean;
  private readonly createdAt: Date;
  private updatedAt: Date;

  constructor(props: OperationRecordProps) {
    this.validateProps(props);
    this.id = props.id;
    this.tenantId = props.tenantId;
    this.serviceDate = props.serviceDate;
    this.seasonId = props.seasonId;
    this.operationId = props.operationId;
    this.machineId = props.machineId;
    this.horimeterStart = props.horimeterStart;
    this.horimeterEnd = props.horimeterEnd;
    this.implementId = props.implementId;
    this.fieldId = props.fieldId;
    this.costCenterId = props.costCenterId;
    this.notes = props.notes;
    this.workers = props.workers.map(w => new OperationRecordWorker(w));
    this.products = props.products.map(p => new OperationRecordProduct(p));
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(
    tenantId: string,
    serviceDate: Date,
    seasonId: string | null | undefined,
    operationId: string,
    machineId: string,
    horimeterStart: number,
    horimeterEnd: number,
    fieldId: string,
    costCenterId: string,
    implementId?: string | null,
    notes?: string | null,
  ): OperationRecord {
    const now = new Date();
    return new OperationRecord({
      id: crypto.randomUUID(),
      tenantId,
      serviceDate,
      seasonId,
      operationId,
      machineId,
      horimeterStart,
      horimeterEnd,
      implementId,
      fieldId,
      costCenterId,
      notes,
      workers: [],
      products: [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  private validateProps(props: OperationRecordProps): void {
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!props.serviceDate) {
      throw new Error('Service date is required');
    }
    // Validate service date is not in the future
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (props.serviceDate > today) {
      throw new Error('Service date cannot be in the future');
    }
    // Season is optional
    if (!props.operationId || props.operationId.trim().length === 0) {
      throw new Error('Operation ID is required');
    }
    if (!props.machineId || props.machineId.trim().length === 0) {
      throw new Error('Machine ID is required');
    }
    if (!props.fieldId || props.fieldId.trim().length === 0) {
      throw new Error('Field ID is required');
    }
    if (!props.costCenterId || props.costCenterId.trim().length === 0) {
      throw new Error('Cost center ID is required');
    }
    if (props.horimeterStart === undefined || props.horimeterStart === null || props.horimeterStart < 0) {
      throw new Error('Horimeter start must be 0 or greater');
    }
    if (props.horimeterEnd === undefined || props.horimeterEnd === null || props.horimeterEnd < 0) {
      throw new Error('Horimeter end must be 0 or greater');
    }
    if (props.horimeterEnd <= props.horimeterStart) {
      throw new Error('Horimeter end must be greater than horimeter start');
    }
  }

  update(
    serviceDate: Date,
    seasonId: string | null | undefined,
    operationId: string,
    machineId: string,
    horimeterStart: number,
    horimeterEnd: number,
    fieldId: string,
    costCenterId: string,
    implementId?: string | null,
    notes?: string | null,
  ): void {
    const tempProps: OperationRecordProps = {
      id: this.id,
      tenantId: this.tenantId,
      serviceDate,
      seasonId,
      operationId,
      machineId,
      horimeterStart,
      horimeterEnd,
      implementId,
      fieldId,
      costCenterId,
      notes,
      workers: this.workers.map(w => ({
        id: w.getId(),
        workerId: w.getWorkerId(),
        startTime: w.getStartTime(),
        endTime: w.getEndTime(),
      })),
      products: this.products.map(p => ({
        id: p.getId(),
        productId: p.getProductId(),
        quantity: p.getQuantity(),
        unitOfMeasureId: p.getUnitOfMeasureId(),
      })),
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };
    this.validateProps(tempProps);
    this.serviceDate = serviceDate;
    this.seasonId = seasonId;
    this.operationId = operationId;
    this.machineId = machineId;
    this.horimeterStart = horimeterStart;
    this.horimeterEnd = horimeterEnd;
    this.implementId = implementId;
    this.fieldId = fieldId;
    this.costCenterId = costCenterId;
    this.notes = notes;
    this.updatedAt = new Date();
  }

  addWorker(worker: OperationRecordWorker): void {
    this.workers.push(worker);
    this.updatedAt = new Date();
  }

  removeWorker(workerId: string): void {
    this.workers = this.workers.filter(w => w.getId() !== workerId);
    this.updatedAt = new Date();
  }

  setWorkers(workers: OperationRecordWorker[]): void {
    this.workers = workers;
    this.updatedAt = new Date();
  }

  addProduct(product: OperationRecordProduct): void {
    this.products.push(product);
    this.updatedAt = new Date();
  }

  removeProduct(productId: string): void {
    this.products = this.products.filter(p => p.getId() !== productId);
    this.updatedAt = new Date();
  }

  setProducts(products: OperationRecordProduct[]): void {
    this.products = products;
    this.updatedAt = new Date();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  // Getters
  getId(): string {
    return this.id;
  }

  getTenantId(): string {
    return this.tenantId;
  }

  getServiceDate(): Date {
    return this.serviceDate;
  }

  getSeasonId(): string | null | undefined {
    return this.seasonId;
  }

  getOperationId(): string {
    return this.operationId;
  }

  getMachineId(): string {
    return this.machineId;
  }

  getHorimeterStart(): number {
    return this.horimeterStart;
  }

  getHorimeterEnd(): number {
    return this.horimeterEnd;
  }

  getImplementId(): string | null | undefined {
    return this.implementId;
  }

  getFieldId(): string {
    return this.fieldId;
  }

  getCostCenterId(): string {
    return this.costCenterId;
  }

  getNotes(): string | null | undefined {
    return this.notes;
  }

  getWorkers(): OperationRecordWorker[] {
    return [...this.workers];
  }

  getProducts(): OperationRecordProduct[] {
    return [...this.products];
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
