-- Add data de registro, registro and livro ou ficha to land_registries

ALTER TABLE land_registries
  ADD COLUMN IF NOT EXISTS data_registro date,
  ADD COLUMN IF NOT EXISTS registro varchar(100),
  ADD COLUMN IF NOT EXISTS livro_ou_ficha varchar(100);
