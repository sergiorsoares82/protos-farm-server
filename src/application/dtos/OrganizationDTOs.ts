export interface OrganizationResponseDTO {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrganizationRequestDTO {
  name: string;
  slug: string;
}

export interface UpdateOrganizationRequestDTO {
  name?: string;
  slug?: string;
  isActive?: boolean;
}
