-- Inscrição estadual pode estar vinculada a uma ou mais matrículas (N:N).
-- Um imóvel rural pode ter muitas inscrições estaduais (já era N:1; removida a restrição 1:1).
-- Cria a tabela de junção state_registration_land_registries.

BEGIN;

CREATE TABLE IF NOT EXISTS state_registration_land_registries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  state_registration_id uuid NOT NULL REFERENCES state_registrations(id) ON DELETE CASCADE,
  land_registry_id uuid NOT NULL REFERENCES land_registries(id) ON DELETE CASCADE,
  CONSTRAINT uq_state_reg_land_reg UNIQUE (state_registration_id, land_registry_id)
);

CREATE INDEX IF NOT EXISTS idx_srlr_tenant_id ON state_registration_land_registries (tenant_id);
CREATE INDEX IF NOT EXISTS idx_srlr_state_registration_id ON state_registration_land_registries (state_registration_id);
CREATE INDEX IF NOT EXISTS idx_srlr_land_registry_id ON state_registration_land_registries (land_registry_id);

COMMIT;
