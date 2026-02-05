-- Expand state_registrations for produtor rural IE (inscrição estadual) and add participants table.
-- Run only if not using TypeORM synchronize.

-- New columns on state_registrations (add if not exists for safety)
ALTER TABLE state_registrations
  ADD COLUMN IF NOT EXISTS cpf_cnpj varchar(50),
  ADD COLUMN IF NOT EXISTS nome_responsavel varchar(255),
  ADD COLUMN IF NOT EXISTS nome_estabelecimento varchar(255),
  ADD COLUMN IF NOT EXISTS cnae_codigo varchar(100),
  ADD COLUMN IF NOT EXISTS cnae_descricao varchar(255),
  ADD COLUMN IF NOT EXISTS regime_apuracao varchar(100),
  ADD COLUMN IF NOT EXISTS categoria varchar(100),
  ADD COLUMN IF NOT EXISTS data_inscricao date,
  ADD COLUMN IF NOT EXISTS data_fim_contrato date,
  ADD COLUMN IF NOT EXISTS data_situacao_inscricao date,
  ADD COLUMN IF NOT EXISTS cep varchar(20),
  ADD COLUMN IF NOT EXISTS municipio varchar(150),
  ADD COLUMN IF NOT EXISTS distrito_povoado varchar(150),
  ADD COLUMN IF NOT EXISTS bairro varchar(150),
  ADD COLUMN IF NOT EXISTS logradouro varchar(255),
  ADD COLUMN IF NOT EXISTS numero varchar(50),
  ADD COLUMN IF NOT EXISTS complemento varchar(150),
  ADD COLUMN IF NOT EXISTS referencia_localizacao varchar(255),
  ADD COLUMN IF NOT EXISTS optante_programa_leite boolean DEFAULT false;

-- Default situacao to ATIVO if currently different
UPDATE state_registrations SET situacao = 'ATIVO' WHERE situacao IS NULL OR situacao = '';

-- Participants table (sociedade em comum de produtor rural)
CREATE TABLE IF NOT EXISTS state_registration_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_registration_id uuid NOT NULL REFERENCES state_registrations(id) ON DELETE CASCADE,
  cpf varchar(50) NOT NULL,
  nome varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_state_registration_participants_state_registration_id
  ON state_registration_participants(state_registration_id);
