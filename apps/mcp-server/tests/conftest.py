"""Shared test fixtures for CoShip MCP Server tests."""

from __future__ import annotations

import os
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from coship_mcp.auth_code import encrypt_auth_code

# Fixed test secret shared between "cockpit" and "MCP server"
TEST_API_SECRET = "test-secret-for-integration-tests-32ch"
TEST_SUPABASE_URL = "https://test-project.supabase.co"
TEST_SUPABASE_ANON_KEY = "test-anon-key"
TEST_SERVER_BASE_URL = "http://localhost:8000"
TEST_COCKPIT_URL = "http://localhost:3000"


@pytest.fixture
def api_secret() -> str:
    return TEST_API_SECRET


@pytest.fixture
def mock_supabase_tokens() -> dict:
    """Fake Supabase session tokens that would come from the cockpit."""
    return {
        "access_token": "sb-access-token-fake-jwt",
        "refresh_token": "sb-refresh-token-fake",
        "expires_in": 3600,
        "created_at": 1700000000,
    }


@pytest.fixture
def encrypted_auth_code(mock_supabase_tokens: dict, api_secret: str) -> str:
    """Encrypt mock Supabase tokens into an auth code (as the cockpit would)."""
    return encrypt_auth_code(mock_supabase_tokens, api_secret)


@pytest.fixture
def _env_vars():
    """Set required environment variables for the MCP server."""
    env = {
        "COSHIP_SUPABASE_URL": TEST_SUPABASE_URL,
        "COSHIP_SUPABASE_ANON_KEY": TEST_SUPABASE_ANON_KEY,
        "COSHIP_SERVER_BASE_URL": TEST_SERVER_BASE_URL,
        "COSHIP_COCKPIT_URL": TEST_COCKPIT_URL,
        "COSHIP_API_SECRET": TEST_API_SECRET,
        "COSHIP_DEV_MODE": "false",
    }
    with patch.dict(os.environ, env, clear=False):
        yield


@pytest.fixture
def mcp_app(_env_vars):
    """Create the Starlette ASGI app with mocked env vars.

    We must import server *after* patching env vars so pydantic-settings
    picks them up.
    """
    # We need to reload the config and server modules so they pick up the
    # patched environment variables.
    import importlib

    import coship_mcp.config as config_mod

    importlib.reload(config_mod)

    import coship_mcp.server as server_mod

    importlib.reload(server_mod)

    app = server_mod.create_app()
    return app


@pytest.fixture
def client(mcp_app) -> httpx.AsyncClient:
    """HTTPX async test client bound to the ASGI app."""
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=mcp_app),
        base_url=TEST_SERVER_BASE_URL,
    )
