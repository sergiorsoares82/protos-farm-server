-- Migration: add parent_id and related_field_id to cost_centers
-- Run this against your database if you are not using TypeORM synchronize.

ALTER TABLE cost_centers
  ADD COLUMN IF NOT EXISTS parent_id uuid NULL REFERENCES cost_centers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS related_field_id uuid NULL REFERENCES fields(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_cost_centers_parent_id ON cost_centers(parent_id);
CREATE INDEX IF NOT EXISTS idx_cost_centers_related_field_id ON cost_centers(related_field_id);
