-- Migration: add cleared_at (data de compensação) to invoice_financials
-- Run this against your database if you are not using TypeORM synchronize.

ALTER TABLE invoice_financials
  ADD COLUMN IF NOT EXISTS cleared_at timestamp NULL;
