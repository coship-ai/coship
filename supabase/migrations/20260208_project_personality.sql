-- Project Personality
-- Stores Ship's personality config per project.
-- Presence of a project_personality row = MCP connected (replaces heartbeat).

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE challenge_level AS ENUM (
  'challenge_actively',
  'raise_concerns_gently',
  'only_serious_risks',
  'trust_judgment'
);

CREATE TYPE transparency_level AS ENUM (
  'just_outcome',
  'explain_reasoning',
  'help_understand',
  'full_trust'
);

CREATE TYPE ux_design_model AS ENUM (
  'ship_decides',
  'ship_proposes_refine',
  'founder_designs',
  'depends_on_feature'
);

CREATE TYPE development_approach AS ENUM (
  'speed_iteration',
  'balanced_quality',
  'robust_start',
  'depends_feature'
);

CREATE TYPE documentation_level AS ENUM (
  'minimal',
  'simple_overview',
  'feature_guides',
  'detailed_technical'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- Core Ship traits + project understanding
CREATE TABLE project_personality (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  challenge_level challenge_level NOT NULL DEFAULT 'challenge_actively',
  transparency_level transparency_level NOT NULL DEFAULT 'just_outcome',
  ux_design_model ux_design_model NOT NULL DEFAULT 'ship_decides',
  development_approach development_approach NOT NULL DEFAULT 'speed_iteration',
  documentation_level documentation_level NOT NULL DEFAULT 'minimal',
  project_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_project_personality_project_id ON project_personality(project_id);

-- ============================================================================
-- TRIGGERS (reuse handle_updated_at from profiles migration)
-- ============================================================================

CREATE TRIGGER on_project_personality_updated
  BEFORE UPDATE ON project_personality
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE project_personality ENABLE ROW LEVEL SECURITY;

-- project_personality policies
CREATE POLICY "Users can read own project personality"
  ON project_personality FOR SELECT
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can insert own project personality"
  ON project_personality FOR INSERT
  WITH CHECK (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can update own project personality"
  ON project_personality FOR UPDATE
  USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

-- Service role access
GRANT ALL ON project_personality TO service_role;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE project_personality IS 'Ship personality traits per project (challenge level, transparency, docs, etc.)';
COMMENT ON COLUMN project_personality.project_summary IS 'Ship''s personalized understanding of the project mission';
