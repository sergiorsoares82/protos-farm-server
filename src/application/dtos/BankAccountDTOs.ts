export interface CreateBankAccountDTO {
  name: string;
  bankName?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
}

export interface UpdateBankAccountDTO {
  name?: string;
  bankName?: string | null;
  agency?: string | null;
  accountNumber?: string | null;
  isActive?: boolean;
}
