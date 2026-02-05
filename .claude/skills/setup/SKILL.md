---
name: setup
description: Set up the CoShip monorepo for local development. Use when initializing the project for the first time.
disable-model-invocation: true
allowed-tools: Bash(pnpm *, cp *, ls *)
---

# Project Setup

Set up the CoShip monorepo for local development.

## Instructions

Run the following steps to set up the project:

### 1. Install all dependencies
```bash
pnpm install:all
```

This installs:
- Node.js dependencies for all workspaces (web, cockpit, ui)
- Python dependencies for the MCP server (via uv)

### 2. Check for .env file
Check if `.env` exists at the project root. If not, copy from `.env.example`:
```bash
cp .env.example .env
```

Then remind the user to configure the following environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `COSHIP_SUPABASE_URL` - Supabase URL for MCP server
- `COSHIP_SERVER_BASE_URL` - MCP server base URL (default: http://localhost:8000)

### 3. Database setup (if Supabase CLI is available)
If the user has Supabase CLI installed and wants to set up the database:
```bash
pnpm db:push
```

### 4. Confirm setup
After setup, list the available development commands:
- `pnpm dev:web` - Landing page (http://localhost:4321)
- `pnpm dev:cockpit` - Dashboard (http://localhost:3000)
- `pnpm dev:mcp` - MCP server (http://localhost:8000)
