export interface CreateOperationDTO {
    code: string;
    description: string;
    activityTypeIds?: string[];
}

export interface UpdateOperationDTO {
    code?: string;
    description?: string;
    activityTypeIds?: string[];
    isActive?: boolean;
}
