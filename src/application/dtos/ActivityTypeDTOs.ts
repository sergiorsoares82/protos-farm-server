export interface CreateActivityTypeDTO {
  name: string;
  /** Only super-admin can set null (creates system type for all organizations). */
  tenantId?: string | null;
}

export interface UpdateActivityTypeDTO {
  name?: string;
  isActive?: boolean;
}
