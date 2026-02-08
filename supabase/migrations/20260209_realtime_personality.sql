-- Enable Supabase Realtime on project_personality
-- so the cockpit auto-refreshes when the matching skill saves config.

ALTER PUBLICATION supabase_realtime ADD TABLE project_personality;
