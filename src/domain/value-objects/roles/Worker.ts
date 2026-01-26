/**
 * Worker Role Value Object
 * Represents worker-specific data
 */
export interface WorkerProps {
  position: string;
  hireDate: Date;
  hourlyRate?: number;
  employmentType: string;
}

export class Worker {
  private readonly position: string;
  private readonly hireDate: Date;
  private readonly hourlyRate?: number;
  private readonly employmentType: string;

  constructor(props: WorkerProps) {
    this.validateProps(props);
    this.position = props.position;
    this.hireDate = props.hireDate;
    if (props.hourlyRate !== undefined) this.hourlyRate = props.hourlyRate;
    this.employmentType = props.employmentType;
  }

  private validateProps(props: WorkerProps): void {
    if (!props.position || props.position.trim().length === 0) {
      throw new Error('Worker position is required');
    }
    if (!props.employmentType || props.employmentType.trim().length === 0) {
      throw new Error('Worker employment type is required');
    }
    if (props.hourlyRate !== undefined && props.hourlyRate < 0) {
      throw new Error('Hourly rate cannot be negative');
    }
    if (!(props.hireDate instanceof Date)) {
      throw new Error('Hire date must be a valid date');
    }
  }

  getPosition(): string {
    return this.position;
  }

  getHireDate(): Date {
    return this.hireDate;
  }

  getHourlyRate(): number | undefined {
    return this.hourlyRate;
  }

  getEmploymentType(): string {
    return this.employmentType;
  }

  toJSON(): WorkerProps {
    return {
      position: this.position,
      hireDate: this.hireDate,
      ...(this.hourlyRate !== undefined && { hourlyRate: this.hourlyRate }),
      employmentType: this.employmentType,
    };
  }
}
