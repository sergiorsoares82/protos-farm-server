-- Migration: add penalty, interest, bank_account_id, invoice_financials_type_id to invoice_financials
-- Run this against your database if you are not using TypeORM synchronize.

ALTER TABLE invoice_financials
  ADD COLUMN IF NOT EXISTS penalty decimal(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS interest decimal(15,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bank_account_id uuid NULL REFERENCES bank_accounts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS invoice_financials_type_id uuid NULL REFERENCES invoice_financials_types(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_invoice_financials_bank_account_id ON invoice_financials(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_invoice_financials_invoice_financials_type_id ON invoice_financials(invoice_financials_type_id);
