import type { AccountType } from '../../domain/enums/AccountType.js';

export interface CreateManagementAccountDTO {
    code: string;
    description: string;
    type: AccountType;
    categoryIds?: string[];
}

export interface UpdateManagementAccountDTO {
    code?: string;
    description?: string;
    type?: AccountType;
    categoryIds?: string[];
    isActive?: boolean;
}
