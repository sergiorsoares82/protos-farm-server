/**
 * PersonRole Enum
 * Defines the available roles a person can have in the system
 */
export enum PersonRole {
  USER = 'USER',
  CLIENT = 'CLIENT',
  SUPPLIER = 'SUPPLIER',
  WORKER = 'WORKER',
  FARM_OWNER = 'FARM_OWNER',
}

/**
 * Type guards for role checking
 */
export const isValidPersonRole = (role: string): role is PersonRole => {
  return Object.values(PersonRole).includes(role as PersonRole);
};

/**
 * Get all available roles
 */
export const getAllPersonRoles = (): PersonRole[] => {
  return Object.values(PersonRole);
};
