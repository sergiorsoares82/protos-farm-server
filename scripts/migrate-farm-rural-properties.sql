-- Migration: Farm <-> Rural Property N:N
-- Run this after rural_properties and farms exist.
-- One farm can be linked to one or more rural properties.

BEGIN;

CREATE TABLE IF NOT EXISTS farm_rural_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  farm_id uuid NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  rural_property_id uuid NOT NULL REFERENCES rural_properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, farm_id, rural_property_id)
);

CREATE INDEX IF NOT EXISTS idx_farm_rural_properties_tenant_id
  ON farm_rural_properties (tenant_id);

CREATE INDEX IF NOT EXISTS idx_farm_rural_properties_farm_id
  ON farm_rural_properties (farm_id);

CREATE INDEX IF NOT EXISTS idx_farm_rural_properties_rural_property_id
  ON farm_rural_properties (rural_property_id);

COMMIT;
