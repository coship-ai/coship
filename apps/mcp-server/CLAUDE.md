# CoShip MCP Server

FastMCP 3.x Python server that provides skills to Claude Desktop for helping non-technical founders build MVPs.

## Architecture

```
apps/mcp-server/
├── src/coship_mcp/
│   ├── server.py            # FastMCP app, MCP tools, HTTP API routes, OAuth proxy
│   ├── config.py            # Pydantic Settings (env vars with COSHIP_ prefix)
│   ├── auth_code.py         # AES-256-GCM encrypt/decrypt for OAuth code exchange
│   ├── skills_registry.py   # Single source of truth for all skill metadata
│   └── middleware/
│       ├── __init__.py
│       └── subscription.py  # Tier gating — blocks pro skills for free users
├── skills/
│   ├── free/
│   │   └── matching/SKILL.md   # Co-founder personality setup (only available skill)
│   └── pro/                    # Empty — pro skills not yet implemented
├── tests/
│   ├── conftest.py
│   ├── test_auth_code_crypto.py
│   └── test_auth_flow.py
├── pyproject.toml
└── railway.toml
```

## Commands

```bash
# From monorepo root
pnpm dev:mcp              # Start server on :8000
pnpm dev:mcp:inspector    # Start with MCP inspector

# From this directory (with venv activated)
source .venv/bin/activate
python -m pytest           # Run tests
python -c "from coship_mcp.server import mcp"  # Quick import check
```

## Key Concepts

### Skills Registry (`skills_registry.py`)

The `SKILLS_REGISTRY` list is the single source of truth for skill metadata. All other systems derive from it:

- **`server.py`** — builds dynamic `instructions` string and `list_skills` tool output
- **`subscription.py`** — derives `PRO_SKILLS` set for tier gating
- **Cockpit** — fetches skills via `/api/skills` HTTP endpoint

**Visibility rules:**
- `status: "available"` — shown everywhere, invocable
- `status: "placeholder"` / `"coming_soon"` — hidden from all discovery layers
- `tier: "pro"` + available — visible in catalog, but `load_skill()` returns upgrade message for free users

### Auth Flow

```
Claude Desktop → OAuthProxy → Cockpit /mcp/authorize (branded UI)
  → User authenticates with Supabase
  → Cockpit encrypts Supabase tokens into AES-256-GCM auth code
  → OAuthProxy callback → /api/mcp/token decrypts → returns JWT to Claude Desktop
  → All subsequent MCP calls include Supabase JWT
```

- `OAuthProxy` in server.py handles the MCP OAuth dance
- `JWTVerifier` validates Supabase ES256 JWTs against JWKS endpoint
- `auth_code.py` handles AES-256-GCM crypto (interop with cockpit TypeScript)
- Shared `COSHIP_API_SECRET` between cockpit and MCP server

### Subscription Tier Middleware

`SubscriptionTierMiddleware` intercepts `resources/read` requests:
- Extracts tier from JWT `app_metadata.subscription_tier`
- Blocks `skill://` resource reads for pro skills when user is free tier
- Raises `PermissionError` which `load_skill()` catches and returns an upgrade message
- `PRO_SKILLS` set derived from registry (`tier == "pro"` and `status == "available"`)

### MCP Tools

| Tool | Auth | Purpose |
|------|------|---------|
| `get_subscription_info` | No | Connection status check |
| `list_skills` | Yes | Tier-aware skill catalog with triggers |
| `list_user_projects` | Yes | User's active projects from Supabase |
| `get_project_context` | Yes | Project details + personality + available skills |
| `load_skill` | Yes | Read skill SKILL.md via `skill://` resource provider |
| `save_project_personality` | Yes | Upsert personality config to `project_personality` table |

### Dynamic Server Instructions

`_build_instructions()` generates the MCP `instructions` string from the registry at startup. Only `status == "available"` skills appear. Claude Desktop receives this during `initialize` handshake (pre-auth, not personalized).

### Skill Prompts

Each available skill is registered as an `@mcp.prompt()` template. These appear in Claude Desktop's prompt selector UI.

### HTTP API Routes (non-MCP)

- `GET /api/skills` — Returns `SKILLS_REGISTRY` as JSON (requires `Authorization: Bearer <API_SECRET>`)
- `POST /api/mcp/token` — OAuth token endpoint (decrypts auth code or refreshes tokens)

## Environment Variables

All prefixed with `COSHIP_`:

| Variable | Required | Description |
|----------|----------|-------------|
| `COSHIP_SUPABASE_URL` | Yes | Supabase project URL |
| `COSHIP_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `COSHIP_SERVER_BASE_URL` | No | Server URL (default: `http://localhost:8000`) |
| `COSHIP_API_SECRET` | Yes | Shared secret with cockpit for auth code crypto |
| `COSHIP_COCKPIT_URL` | No | Cockpit URL (default: `http://localhost:3000`) |
| `COSHIP_DEV_MODE` | No | Disable OAuth for local dev (default: `true`) |
| `COSHIP_SKILLS_DIR` | No | Skills directory relative to package (default: `skills`) |

## Adding a New Skill

1. Add entry to `SKILLS_REGISTRY` in `skills_registry.py` with `triggers` list
2. Create `skills/<tier>/<skill-id>/SKILL.md` with YAML frontmatter (`name`, `description`)
3. Set `status: "available"` when ready (starts hidden as `placeholder` or `coming_soon`)
4. The skill auto-registers as a prompt template, appears in `list_skills`, and is included in server instructions

## Testing

```bash
source .venv/bin/activate
python -m pytest                    # All tests
python -m pytest tests/test_auth_code_crypto.py  # Crypto unit tests
python -m pytest tests/test_auth_flow.py         # OAuth integration tests
```

Tests use mocked env vars and httpx test client. See `conftest.py` for fixtures.

## Deployment

Railway via `railway.toml`:
```
startCommand = "fastmcp run src/coship_mcp/server.py --transport http --port $PORT"
```

## Gotchas

- `PRO_SKILLS` is an empty set until a pro skill gets `status: "available"` — this is correct
- Server instructions are built once at import time, not per-request
- The `skills/pro/` directory doesn't exist yet — `SkillsDirectoryProvider` logs a debug warning but continues fine
- `PermissionError` from middleware must be caught in `load_skill()` to return a friendly upgrade message instead of crashing
- Skill SKILL.md files have YAML frontmatter that gets stripped before returning content
