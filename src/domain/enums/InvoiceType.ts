/**
 * Tipo de invoice: receita ou despesa
 */
export enum InvoiceType {
  RECEITA = 'RECEITA',
  DESPESA = 'DESPESA',
}

export const isValidInvoiceType = (value: string): value is InvoiceType =>
  Object.values(InvoiceType).includes(value as InvoiceType);
