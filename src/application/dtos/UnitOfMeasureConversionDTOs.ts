export interface CreateUnitOfMeasureConversionDTO {
  fromUnitId: string;
  toUnitId: string;
  /** 1 fromUnit = factor * toUnit. */
  factor: number;
  /** SuperAdmin only: system-wide conversion for all organizations. */
  isSystem?: boolean;
  /** For SuperAdmin: optional org id; for OrgAdmin: ignored. */
  tenantId?: string | null;
}

export interface UpdateUnitOfMeasureConversionDTO {
  factor?: number;
}
