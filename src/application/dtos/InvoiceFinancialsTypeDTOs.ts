export interface CreateInvoiceFinancialsTypeDTO {
  name: string;
  /** Only super admin can pass tenantId; null = system type. */
  tenantId?: string | null;
}

export interface UpdateInvoiceFinancialsTypeDTO {
  name?: string;
  isActive?: boolean;
}
