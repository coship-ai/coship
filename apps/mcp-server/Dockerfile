# Build context: apps/mcp-server (set as root directory in Railway)
# docker build -t coship-mcp .

FROM python:3.11-slim

WORKDIR /app

# Install uv for fast dependency resolution
RUN pip install --no-cache-dir uv==0.4.30

# Copy only dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies only (skip editable project install)
RUN uv sync --no-dev --frozen --no-install-project

# Copy application source
COPY . .

# Now install the project itself
RUN uv sync --no-dev --frozen

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE ${PORT:-8000}

CMD fastmcp run src/coship_mcp/server.py --transport http --host 0.0.0.0 --port ${PORT:-8000}
