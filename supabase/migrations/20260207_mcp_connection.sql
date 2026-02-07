-- MCP Connection Tracking
-- Adds mcp_connected_at to profiles to track when a user first connects via MCP

ALTER TABLE profiles
  ADD COLUMN mcp_connected_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.mcp_connected_at IS 'Timestamp of last MCP heartbeat, null if never connected';
