export interface FieldSeasonLink {
  fieldId: string;
  seasonId?: string;
  areaHectares: number;
  costCenterId: string;
}

export interface IFieldSeasonRepository {
  getLinksForSeason(seasonId: string, tenantId: string): Promise<FieldSeasonLink[]>;
  getLatestSeasonForField(fieldId: string, tenantId: string): Promise<FieldSeasonLink | null>;
  upsertLink(
    tenantId: string,
    seasonId: string,
    fieldId: string,
    costCenterId: string,
    areaHectares: number,
  ): Promise<void>;
  deleteLink(tenantId: string, seasonId: string, fieldId: string): Promise<void>;
}

