export interface CreateUnitOfMeasureDTO {
  code: string;
  name: string;
  /** If true, creates a system-wide unit (SuperAdmin only). */
  isSystem?: boolean;
  /** For SuperAdmin: optional org id; for OrgAdmin: ignored, uses own tenant. */
  tenantId?: string | null;
}

export interface UpdateUnitOfMeasureDTO {
  code?: string;
  name?: string;
  isActive?: boolean;
}
