---
name: build
description: Build CoShip apps for production deployment. Supports building all apps or specific ones.
argument-hint: "[all|web|cockpit]"
disable-model-invocation: true
allowed-tools: Bash(pnpm *)
---

# Build for Production

Build CoShip apps for production deployment.

## Usage

- `/build` or `/build all` - Build all apps
- `/build web` - Build the landing page only
- `/build cockpit` - Build the dashboard only

## Instructions

Based on `$ARGUMENTS`, run the appropriate build command:

### Build All
```bash
pnpm build
```

### Build Landing Page
```bash
pnpm build:web
```
Output: `apps/web/dist/`

### Build Dashboard
```bash
pnpm build:cockpit
```
Output: `apps/cockpit/.output/`

## Deployment Targets

### Landing Page (apps/web)
- **Platform**: Vercel, Netlify, or any static host
- **Build command**: `pnpm build:web`
- **Output**: `apps/web/dist/`

### Dashboard (apps/cockpit)
- **Platform**: Vercel (Node.js)
- **Build command**: `pnpm build:cockpit`
- **Root directory**: `apps/cockpit`

### MCP Server (apps/mcp-server)
- **Platform**: Railway
- **Config**: `apps/mcp-server/railway.toml`
- **Required env vars**: `COSHIP_SUPABASE_URL`, `COSHIP_SERVER_BASE_URL`

## Preview Production Builds

After building, preview locally:
```bash
pnpm preview:web      # Landing page
pnpm preview:cockpit  # Dashboard
```
