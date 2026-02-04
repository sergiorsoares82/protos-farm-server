-- Migration script for fundiária & operação model
-- Creates core tables: rural_properties, land_registries, property_ownerships,
-- state_registrations, production_sites, production_site_parcels,
-- production_site_state_registrations, exploration_contracts.

BEGIN;

CREATE TABLE IF NOT EXISTS rural_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  codigo_sncr varchar(100),
  nirf varchar(100),
  nome_imovel_incra varchar(255) NOT NULL,
  municipio varchar(150),
  uf varchar(2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rural_properties_tenant_id
  ON rural_properties (tenant_id);

CREATE INDEX IF NOT EXISTS idx_rural_properties_codigo_sncr
  ON rural_properties (codigo_sncr);

CREATE TABLE IF NOT EXISTS land_registries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  rural_property_id uuid,
  numero_matricula varchar(100) NOT NULL,
  cartorio varchar(255) NOT NULL,
  area_ha numeric(12,2),
  municipio varchar(150),
  uf varchar(2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_land_registries_tenant_id
  ON land_registries (tenant_id);

CREATE INDEX IF NOT EXISTS idx_land_registries_rural_property_id
  ON land_registries (rural_property_id);

CREATE TABLE IF NOT EXISTS property_ownerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  land_registry_id uuid NOT NULL,
  person_id uuid NOT NULL,
  percentual_posse numeric(7,4),
  data_aquisicao date,
  data_baixa date,
  tipo_aquisicao varchar(50),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_tenant_id
  ON property_ownerships (tenant_id);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_land_registry_id
  ON property_ownerships (land_registry_id);

CREATE INDEX IF NOT EXISTS idx_property_ownerships_person_id
  ON property_ownerships (person_id);

CREATE TABLE IF NOT EXISTS state_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  person_id uuid NOT NULL,
  numero_ie varchar(50) NOT NULL,
  uf varchar(2) NOT NULL,
  situacao varchar(20) NOT NULL DEFAULT 'ATIVA',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_state_registrations_tenant_id
  ON state_registrations (tenant_id);

CREATE INDEX IF NOT EXISTS idx_state_registrations_person_id
  ON state_registrations (person_id);

CREATE TABLE IF NOT EXISTS production_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  farm_id uuid NOT NULL,
  nome_bloco varchar(255) NOT NULL,
  descricao text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_sites_tenant_id
  ON production_sites (tenant_id);

CREATE INDEX IF NOT EXISTS idx_production_sites_farm_id
  ON production_sites (farm_id);

CREATE TABLE IF NOT EXISTS production_site_parcels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  production_site_id uuid NOT NULL,
  land_registry_id uuid NOT NULL,
  area_ha numeric(12,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_site_parcels_tenant_id
  ON production_site_parcels (tenant_id);

CREATE INDEX IF NOT EXISTS idx_production_site_parcels_production_site_id
  ON production_site_parcels (production_site_id);

CREATE INDEX IF NOT EXISTS idx_production_site_parcels_land_registry_id
  ON production_site_parcels (land_registry_id);

CREATE TABLE IF NOT EXISTS production_site_state_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  production_site_id uuid NOT NULL,
  state_registration_id uuid NOT NULL,
  data_inicio_vigencia date NOT NULL,
  data_fim_vigencia date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_production_site_state_reg_tenant_id
  ON production_site_state_registrations (tenant_id);

CREATE INDEX IF NOT EXISTS idx_production_site_state_reg_production_site_id
  ON production_site_state_registrations (production_site_id);

CREATE INDEX IF NOT EXISTS idx_production_site_state_reg_state_registration_id
  ON production_site_state_registrations (state_registration_id);

CREATE TABLE IF NOT EXISTS exploration_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  farm_id uuid NOT NULL,
  production_site_id uuid,
  explorer_id uuid NOT NULL,
  land_owner_id uuid,
  state_registration_id uuid,
  tipo_contrato varchar(20) NOT NULL,
  data_inicio date NOT NULL,
  data_fim date,
  valor_contrato numeric(14,2),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_tenant_id
  ON exploration_contracts (tenant_id);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_farm_id
  ON exploration_contracts (farm_id);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_production_site_id
  ON exploration_contracts (production_site_id);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_explorer_id
  ON exploration_contracts (explorer_id);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_land_owner_id
  ON exploration_contracts (land_owner_id);

CREATE INDEX IF NOT EXISTS idx_exploration_contracts_state_registration_id
  ON exploration_contracts (state_registration_id);

COMMIT;

