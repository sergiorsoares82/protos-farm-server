-- Migrate farm_owners to N:N with new farms table.
-- Run this ONCE before deploying the new code that uses FarmEntity and farm_id on farm_owners.
-- Requires: farm_owners has columns farm_name, farm_location, total_area.

-- 1. Create farms table (with temp column to link from farm_owners)
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  location TEXT,
  total_area DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add temp column only if we need to migrate (skip if farms already has data and farm_owners has farm_id)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farm_owners' AND column_name = 'farm_name') THEN
    ALTER TABLE farms ADD COLUMN IF NOT EXISTS migrate_fo_id UUID;
  END IF;
END $$;

-- 2. Add farm_id to farm_owners (ignore if already added)
ALTER TABLE farm_owners ADD COLUMN IF NOT EXISTS farm_id UUID;

-- 3. Create one farm per existing farm_owners row and link by migrate_fo_id
INSERT INTO farms (id, tenant_id, name, location, total_area, created_at, updated_at, migrate_fo_id)
SELECT gen_random_uuid(), tenant_id, COALESCE(farm_name, 'A definir'), farm_location, total_area, created_at, updated_at, id
FROM farm_owners
WHERE farm_id IS NULL AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'farm_owners' AND column_name = 'farm_name');

UPDATE farm_owners fo
SET farm_id = f.id
FROM farms f
WHERE f.migrate_fo_id = fo.id;

ALTER TABLE farms DROP COLUMN IF EXISTS migrate_fo_id;

-- 4. Drop old columns (run only when application expects new schema)
ALTER TABLE farm_owners DROP COLUMN IF EXISTS farm_name;
ALTER TABLE farm_owners DROP COLUMN IF EXISTS farm_location;
ALTER TABLE farm_owners DROP COLUMN IF EXISTS total_area;

-- 5. Optional: add FK and unique (person_id, farm_id) if not using TypeORM synchronize
-- ALTER TABLE farm_owners ADD CONSTRAINT fk_farm_owners_farm FOREIGN KEY (farm_id) REFERENCES farms(id);
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_farm_owners_person_farm ON farm_owners (person_id, farm_id);
