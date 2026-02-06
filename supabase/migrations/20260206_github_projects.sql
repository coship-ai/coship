-- GitHub OAuth + Projects Schema
-- Adds GitHub fields to profiles and creates projects table

-- Add GitHub fields to profiles
ALTER TABLE profiles
  ADD COLUMN github_username TEXT,
  ADD COLUMN github_avatar_url TEXT,
  ADD COLUMN github_provider_token TEXT;

-- Create project status enum
CREATE TYPE project_status AS ENUM ('creating', 'active', 'failed', 'archived');

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  template_repo TEXT,
  github_repo_url TEXT,
  github_repo_full_name TEXT,
  status project_status NOT NULL DEFAULT 'creating',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint on user + slug
CREATE UNIQUE INDEX idx_projects_user_slug ON projects(user_id, slug);

-- Index for user lookups
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Users can read their own projects
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own projects
CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects
CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reuse handle_updated_at() trigger from profiles migration
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant access to service role
GRANT ALL ON projects TO service_role;

-- Comments
COMMENT ON TABLE projects IS 'User projects bootstrapped from templates';
COMMENT ON COLUMN projects.template_repo IS 'Source template repo, e.g. coship-hq/saas-starter';
COMMENT ON COLUMN projects.status IS 'Project creation lifecycle status';
