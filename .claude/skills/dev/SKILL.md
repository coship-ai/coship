---
name: dev
description: Start development servers for CoShip apps. Use when starting local development or when the user asks to run the project.
argument-hint: "[all|web|cockpit|mcp]"
disable-model-invocation: true
allowed-tools: Bash(pnpm *)
---

# Start Development Servers

Start development server(s) for local development.

## Usage

- `/dev` or `/dev all` - Start all servers (web, cockpit, mcp)
- `/dev web` - Start only the landing page (Astro) on port 4321
- `/dev cockpit` - Start only the dashboard (TanStack Start) on port 3000
- `/dev mcp` - Start only the MCP server on port 8000

## Instructions

Based on the argument `$ARGUMENTS`, run the appropriate development command(s).

### All Servers (default)

Start all three servers in background:

```bash
pnpm dev:web      # Landing page → http://localhost:4321
pnpm dev:cockpit  # Dashboard → http://localhost:3000
pnpm dev:mcp      # MCP server → http://localhost:8000
```

Run each command as a background task so they run in parallel.

### Landing Page Only
```bash
pnpm dev:web
```

### Dashboard Only
```bash
pnpm dev:cockpit
```

### MCP Server Only
Requires `COSHIP_SUPABASE_URL` environment variable to be set.
```bash
pnpm dev:mcp
```

After starting the server(s), inform the user which URLs are available:
- **Landing Page**: http://localhost:4321
- **Dashboard**: http://localhost:3000
- **MCP Server**: http://localhost:8000
