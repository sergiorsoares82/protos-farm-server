export interface FieldSeasonLink {
  fieldId: string;
  areaHectares: number;
}

export interface IFieldSeasonRepository {
  getLinksForSeason(seasonId: string, tenantId: string): Promise<FieldSeasonLink[]>;
  upsertLink(
    tenantId: string,
    seasonId: string,
    fieldId: string,
    areaHectares: number,
  ): Promise<void>;
  deleteLink(tenantId: string, seasonId: string, fieldId: string): Promise<void>;
}

