-- Merge documentation_level into project_personality, drop project_preferences
-- documentation_level was the only useful field in project_preferences;
-- marketing_owner is no longer part of the product (CoShip is tech-side only).

-- Move documentation_level into project_personality
ALTER TABLE project_personality
  ADD COLUMN documentation_level documentation_level NOT NULL DEFAULT 'minimal';

-- Drop the now-empty project_preferences table and its dependents
DROP TABLE IF EXISTS project_preferences CASCADE;

-- Drop the marketing_owner enum (no longer used)
DROP TYPE IF EXISTS marketing_owner;
