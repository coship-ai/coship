# Build context: repo root (so pnpm workspace resolution works)
# docker build -f apps/cockpit/Dockerfile -t coship-cockpit .

# ── Stage 1: Dependencies ─────────────────────────────────────
FROM node:22-slim AS deps

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

WORKDIR /app

# Copy workspace manifests for dependency resolution
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/cockpit/package.json apps/cockpit/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json

RUN pnpm install --frozen-lockfile

# ── Stage 2: Build ────────────────────────────────────────────
FROM deps AS build

# Copy source for cockpit + shared ui package
COPY apps/cockpit/ apps/cockpit/
COPY packages/ui/ packages/ui/

# Clean stale build artifacts to prevent hash mismatches
RUN rm -rf apps/cockpit/.output apps/cockpit/dist

# Vite inlines VITE_* env vars at build time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_APP_URL
ARG VITE_MCP_SERVER_URL

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_APP_URL=$VITE_APP_URL
ENV VITE_MCP_SERVER_URL=$VITE_MCP_SERVER_URL

RUN pnpm --filter @coship/cockpit build

# ── Stage 3: Runtime ──────────────────────────────────────────
FROM node:22-slim AS runtime

WORKDIR /app

# Nitro bundles everything into .output — no node_modules needed
COPY --from=build /app/apps/cockpit/.output .output

ENV NODE_ENV=production

EXPOSE ${PORT:-3000}

CMD ["node", ".output/server/index.mjs"]
