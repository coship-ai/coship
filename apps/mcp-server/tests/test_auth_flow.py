"""Integration tests for the OAuth proxy auth flow.

Tests run against the Starlette ASGI app via httpx.AsyncClient — no real
HTTP server or external services needed.
"""

from __future__ import annotations

from urllib.parse import parse_qs, urlparse

import httpx
import pytest

from tests.conftest import TEST_COCKPIT_URL, TEST_SERVER_BASE_URL


# ---------------------------------------------------------------------------
# OAuth Discovery
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_oauth_discovery(client: httpx.AsyncClient):
    """GET /.well-known/oauth-authorization-server returns valid metadata."""
    resp = await client.get("/.well-known/oauth-authorization-server")
    assert resp.status_code == 200
    data = resp.json()

    # Must have local endpoints (not upstream/supabase)
    assert "authorization_endpoint" in data
    assert "token_endpoint" in data
    assert "registration_endpoint" in data

    # Endpoints should point at the MCP server, not supabase
    assert data["authorization_endpoint"].startswith(TEST_SERVER_BASE_URL)
    assert data["token_endpoint"].startswith(TEST_SERVER_BASE_URL)
    assert data["registration_endpoint"].startswith(TEST_SERVER_BASE_URL)


# ---------------------------------------------------------------------------
# Dynamic Client Registration (DCR)
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_dcr_registration(client: httpx.AsyncClient):
    """POST /register returns client_id for valid client metadata."""
    resp = await client.post(
        "/register",
        json={
            "redirect_uris": ["http://localhost:12345/callback"],
            "client_name": "Test Client",
            "grant_types": ["authorization_code", "refresh_token"],
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "client_id" in data


# ---------------------------------------------------------------------------
# Authorize Redirect
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_authorize_redirects_to_cockpit(client: httpx.AsyncClient):
    """GET /authorize with valid params redirects to cockpit /mcp/authorize."""
    # First register a client
    reg_resp = await client.post(
        "/register",
        json={
            "redirect_uris": ["http://localhost:12345/callback"],
            "client_name": "Test Client",
        },
    )
    client_id = reg_resp.json()["client_id"]

    # Hit /authorize (follow_redirects=False to inspect the redirect)
    resp = await client.get(
        "/authorize",
        params={
            "response_type": "code",
            "client_id": client_id,
            "redirect_uri": "http://localhost:12345/callback",
            "state": "test-state-123",
            "code_challenge": "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
            "code_challenge_method": "S256",
        },
        follow_redirects=False,
    )
    assert resp.status_code == 302

    location = resp.headers["location"]
    parsed = urlparse(location)

    # Should redirect to cockpit's /mcp/authorize
    assert parsed.scheme == "http"
    assert parsed.netloc == "localhost:3000"
    assert parsed.path == "/mcp/authorize"

    # Should include required query params
    qs = parse_qs(parsed.query)
    assert qs["response_type"] == ["code"]
    assert qs["client_id"] == ["coship-internal"]
    assert "state" in qs  # transaction ID
    # redirect_uri should point back to MCP server's /auth/callback
    assert qs["redirect_uri"][0].startswith(TEST_SERVER_BASE_URL)
    assert "/auth/callback" in qs["redirect_uri"][0]


# ---------------------------------------------------------------------------
# Token Endpoint
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_token_endpoint_decrypts_auth_code(
    client: httpx.AsyncClient,
    encrypted_auth_code: str,
    mock_supabase_tokens: dict,
):
    """POST /api/mcp/token with valid encrypted code returns Supabase tokens."""
    resp = await client.post(
        "/api/mcp/token",
        data={
            "grant_type": "authorization_code",
            "code": encrypted_auth_code,
            "client_id": "coship-internal",
            "client_secret": client.base_url and "test-secret-for-integration-tests-32ch",
            "redirect_uri": f"{TEST_SERVER_BASE_URL}/auth/callback",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["access_token"] == mock_supabase_tokens["access_token"]
    assert data["refresh_token"] == mock_supabase_tokens["refresh_token"]
    assert data["token_type"] == "bearer"
    assert data["expires_in"] == mock_supabase_tokens["expires_in"]


@pytest.mark.asyncio
async def test_token_endpoint_rejects_invalid_client(
    client: httpx.AsyncClient,
    encrypted_auth_code: str,
):
    """POST /api/mcp/token with wrong client_secret returns 401."""
    resp = await client.post(
        "/api/mcp/token",
        data={
            "grant_type": "authorization_code",
            "code": encrypted_auth_code,
            "client_id": "coship-internal",
            "client_secret": "wrong-secret",
            "redirect_uri": f"{TEST_SERVER_BASE_URL}/auth/callback",
        },
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_endpoint_rejects_tampered_code(
    client: httpx.AsyncClient,
):
    """POST /api/mcp/token with tampered code returns 400."""
    resp = await client.post(
        "/api/mcp/token",
        data={
            "grant_type": "authorization_code",
            "code": "this-is-not-valid-encrypted-data",
            "client_id": "coship-internal",
            "client_secret": "test-secret-for-integration-tests-32ch",
            "redirect_uri": f"{TEST_SERVER_BASE_URL}/auth/callback",
        },
    )
    assert resp.status_code == 400
