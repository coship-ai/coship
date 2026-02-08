# CoShip Monorepo

CoShip is an Agentic Co-founder product that helps non-technical founders build MVPs using Claude.

## Monorepo Structure

```
coship/
├── apps/
│   ├── web/           # Astro landing page (port 4321)
│   ├── mcp-server/    # FastMCP Python server (port 8000)
│   └── cockpit/       # TanStack Start auth + dashboard (port 3000)
├── packages/
│   └── ui/            # Shared Tailwind v4 theme
├── supabase/
│   └── migrations/    # Database schema
└── .claude/
    └── skills/        # Claude Code skills
```

## Tech Stack

- **Landing Page**: Astro 5 + Tailwind CSS v4
- **Dashboard**: TanStack Start + React 19 + Tailwind CSS v4
- **MCP Server**: FastMCP 3.x + Python 3.11+ + Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe (planned)
- **Fonts**: Clash Display (headings), Satoshi (body)

## Commands

All commands run through pnpm:

```bash
# Setup
pnpm install:all      # Install Node + Python dependencies

# Development
pnpm dev:web          # Landing page (http://localhost:4321)
pnpm dev:cockpit      # Dashboard (http://localhost:3000)
pnpm dev:mcp          # MCP server HTTP (http://localhost:8000)
pnpm dev:mcp:inspector # MCP inspector for debugging

# Build
pnpm build            # Build all apps
pnpm build:web        # Build landing page
pnpm build:cockpit    # Build dashboard

# Preview
pnpm preview:web      # Preview landing page build
pnpm preview:cockpit  # Preview dashboard build

# Database
pnpm db:push          # Push migrations to Supabase
pnpm db:reset         # Reset database (destructive)

# Maintenance
pnpm clean            # Remove all node_modules and .venv
```

## Claude Code Skills

Available skills for local development:

| Skill | Description |
|---------|-------------|
| `/dev` | Start development servers |
| `/setup` | Initial project setup |
| `/build` | Build for production |
| `/db` | Database operations |
| `/skill` | Create new MCP skills |
| `/status` | Check project status |

## Apps

### apps/web (Landing Page)

Astro 5 static site with marketing content.

```
apps/web/
├── src/
│   ├── components/
│   │   ├── icons/        # SVG icon components (ShipLogo)
│   │   ├── layout/       # Header, Footer
│   │   ├── sections/     # Hero, Process, Comparison, FAQ, Pricing
│   │   └── ui/           # Button, Card, Container
│   ├── layouts/          # BaseLayout with meta tags
│   ├── pages/            # Page routes (index.astro)
│   └── styles/           # global.css imports shared theme
└── public/
    └── fonts/            # Clash Display, Satoshi
```

### apps/cockpit (Dashboard)

TanStack Start full-stack app with Supabase auth.

```
apps/cockpit/
├── src/
│   ├── routes/
│   │   ├── __root.tsx       # Root layout
│   │   ├── index.tsx        # Landing/redirect
│   │   ├── login.tsx        # Branded login
│   │   ├── signup.tsx       # Branded signup
│   │   ├── logout.tsx       # Logout handler
│   │   └── _authed/         # Protected routes
│   │       ├── dashboard.tsx
│   │       └── settings.tsx
│   ├── utils/
│   │   └── supabase.ts      # Supabase client
│   ├── components/
│   │   ├── AuthForm.tsx
│   │   └── ShipLogo.tsx
│   └── styles/
│       └── app.css          # Imports shared theme
└── public/
    └── fonts/
```

### apps/mcp-server (MCP Server)

FastMCP 3.x Python server with subscription gating.

```
apps/mcp-server/
├── src/coship_mcp/
│   ├── server.py           # Main entry point
│   ├── config.py           # Settings via pydantic-settings
│   └── middleware/
│       └── subscription.py # Tier gating middleware
├── skills/
│   ├── free/               # Skills for free tier
│   └── pro/                # Skills for pro tier
├── pyproject.toml
└── railway.toml            # Railway deployment config
```

## Packages

### packages/ui (Shared Theme)

Tailwind v4 theme configuration shared across apps.

- **Colors**: Ocean blue palette (`ocean-50` to `ocean-950`), dark backgrounds
- **Fonts**: `--font-family-display` (Clash Display), `--font-family-sans` (Satoshi)
- **Animations**: `sail-sway`, `wave-flow`, `float`, `glow-pulse`, `fade-in-up`

## Authentication Flow

```
User registers in Cockpit → Supabase creates user → Profile created (tier=free)
    → User gets JWT (contains subscription_tier in app_metadata)
    → JWT used with MCP server → SupabaseProvider validates JWT
    → Middleware extracts tier → Skills filtered by subscription level
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- `COSHIP_SUPABASE_URL` - Supabase URL for MCP server
- `COSHIP_SERVER_BASE_URL` - MCP server base URL

## Database

Run Supabase migrations:
```bash
pnpm db:push
```

Key tables:
- `profiles` - User profiles with subscription tier
- Triggers sync `subscription_tier` to JWT `app_metadata`

## Interaction Model

CoShip is **synchronous and user-driven**. The founder using Claude Desktop drives all interactions — Ship responds to their requests via MCP skills. There is no autonomous/async agent behavior. Autonomous features (e.g. AutoShip with async updates) are a future product tier, not part of the current architecture.

## Deployment

- **Landing Page**: Vercel/Netlify (static)
- **Cockpit**: Vercel (Node.js)
- **MCP Server**: Railway (see `apps/mcp-server/railway.toml`)
