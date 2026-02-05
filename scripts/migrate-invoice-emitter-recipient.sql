-- Migrate invoice to emitter/recipient model.
-- Run after TypeORM has added columns (synchronize: true or run migrations).
-- 1) Copy legacy supplier_id to emitter_supplier_id for DESPESA (compra)
UPDATE invoices
SET emitter_supplier_id = supplier_id
WHERE type = 'DESPESA'
  AND supplier_id IS NOT NULL
  AND (emitter_supplier_id IS NULL OR emitter_supplier_id != supplier_id);

-- 2) Optional: make supplier_id nullable if your schema still has it NOT NULL
-- ALTER TABLE invoices ALTER COLUMN supplier_id DROP NOT NULL;
