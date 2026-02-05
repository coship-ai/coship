# CoShip MCP Server

Agentic Co-founder MCP server powered by FastMCP.

## Setup

```bash
uv sync
```

## Development

```bash
uv run fastmcp dev src/coship_mcp/server.py
```

## Production

```bash
uv run fastmcp run src/coship_mcp/server.py --transport http --port 8000
```

## Environment Variables

- `COSHIP_SUPABASE_URL` - Supabase project URL
- `COSHIP_SERVER_BASE_URL` - Server base URL for OAuth callbacks

## Skills

Skills are organized by subscription tier:
- `skills/free/` - Available to all users
- `skills/pro/` - Requires Pro subscription
