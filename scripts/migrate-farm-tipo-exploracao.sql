-- Add tipo de exploração (própria/arrendada) and arrendamento fields to farms.
-- Run once. Safe to re-run. Does nothing if the farms table does not exist yet.

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'farms') THEN
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS tipo_exploracao VARCHAR(20) DEFAULT 'PROPRIO';
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS proprietario_nome TEXT;
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS data_inicio_arrendamento DATE;
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS data_fim_arrendamento DATE;
    UPDATE farms SET tipo_exploracao = 'PROPRIO' WHERE tipo_exploracao IS NULL;
  END IF;
END $$;

COMMIT;
