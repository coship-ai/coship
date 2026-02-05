---
name: status
description: Check the status of the CoShip monorepo including dependencies, environment, and running services.
disable-model-invocation: true
allowed-tools: Bash(ls *, lsof *, git *)
---

# Project Status

Check the status of the CoShip monorepo and its services.

## Instructions

Run the following checks and report the status:

### 1. Check Dependencies
Verify all dependencies are installed:
```bash
# Check if node_modules exists
ls -la node_modules 2>/dev/null && echo "Node dependencies: OK" || echo "Node dependencies: MISSING - run 'pnpm install'"

# Check if Python venv exists
ls -la apps/mcp-server/.venv 2>/dev/null && echo "Python dependencies: OK" || echo "Python dependencies: MISSING - run 'pnpm install:mcp'"
```

### 2. Check Environment
Verify environment configuration:
```bash
# Check if .env exists
ls -la .env 2>/dev/null && echo ".env file: OK" || echo ".env file: MISSING - copy from .env.example"
```

### 3. Check for Running Services
Check if development servers are running:
```bash
# Check ports
lsof -i :4321 2>/dev/null && echo "Landing page (4321): RUNNING" || echo "Landing page (4321): NOT RUNNING"
lsof -i :3000 2>/dev/null && echo "Dashboard (3000): RUNNING" || echo "Dashboard (3000): NOT RUNNING"
lsof -i :8000 2>/dev/null && echo "MCP server (8000): RUNNING" || echo "MCP server (8000): NOT RUNNING"
```

### 4. Git Status
Show current git status:
```bash
git status --short
git branch --show-current
```

## Quick Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm install:all` | Install all dependencies |
| `pnpm dev:web` | Start landing page |
| `pnpm dev:cockpit` | Start dashboard |
| `pnpm dev:mcp` | Start MCP server |
| `pnpm build` | Build all apps |
| `pnpm clean` | Remove all node_modules and .venv |
