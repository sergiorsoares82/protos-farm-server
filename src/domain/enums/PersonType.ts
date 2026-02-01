/**
 * Tipo de pessoa: física ou jurídica
 */
export enum PersonType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA',
}

export const isValidPersonType = (value: string): value is PersonType => {
  return Object.values(PersonType).includes(value as PersonType);
};
