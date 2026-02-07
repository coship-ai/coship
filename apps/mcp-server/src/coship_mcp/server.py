"""CoShip MCP Server - Main entry point.

This server provides skills for helping non-technical founders build MVPs.
Authentication uses OAuthProxy to route the authorization UI through the
cockpit (branded CoShip page) while handling DCR locally for Claude Desktop.
"""

import logging
from pathlib import Path

from fastmcp import FastMCP
from fastmcp.dependencies import Depends
from fastmcp.server.auth import AccessToken
from fastmcp.server.dependencies import get_access_token
from fastmcp.server.auth.oauth_proxy import OAuthProxy
from fastmcp.server.auth.providers.jwt import JWTVerifier
from fastmcp.server.providers.skills import SkillsDirectoryProvider
from starlette.requests import Request
from starlette.responses import JSONResponse

from coship_mcp.auth_code import decrypt_auth_code
from coship_mcp.config import settings
from coship_mcp.middleware import SubscriptionTierMiddleware
from coship_mcp.skills_registry import SKILLS_REGISTRY

# Enable DEBUG logging for FastMCP auth to see exactly why tokens are rejected
logging.getLogger("fastmcp").setLevel(logging.DEBUG)

# --- Token verifier (validates Supabase JWTs returned via proxy) ---
token_verifier = JWTVerifier(
    jwks_uri=f"{settings.supabase_url}/auth/v1/.well-known/jwks.json",
    issuer=f"{settings.supabase_url}/auth/v1",
    algorithm="ES256",
)

# --- OAuth proxy: cockpit is the "upstream" authorization server ---
auth = OAuthProxy(
    upstream_authorization_endpoint=f"{settings.cockpit_url_clean}/mcp/authorize",
    upstream_token_endpoint=f"{settings.server_base_url_clean}/api/mcp/token",
    upstream_client_id="coship-internal",
    upstream_client_secret=settings.api_secret,
    token_verifier=token_verifier,
    base_url=settings.server_base_url_clean,
    require_authorization_consent=False,
    forward_pkce=False,
    token_endpoint_auth_method="client_secret_post",
)

# Create the MCP server
mcp = FastMCP(settings.server_name, auth=auth)

# Add subscription tier middleware
mcp.add_middleware(SubscriptionTierMiddleware())

# Get the skills directory relative to this file
skills_root = Path(__file__).parent.parent.parent / settings.skills_dir

# Add skills providers for each tier
# Skills are organized by subscription tier: free/ and pro/
mcp.add_provider(
    SkillsDirectoryProvider(
        roots=[
            skills_root / "free",
            skills_root / "pro",
        ],
        reload=True,  # Enable hot reload in development
    )
)


@mcp.tool
def get_subscription_info() -> dict:
    """Get information about the user's subscription tier."""
    return {
        "message": "Connected to CoShip MCP Server",
        "skills_available": True,
    }


@mcp.tool
def heartbeat(token: AccessToken | None = Depends(get_access_token)) -> dict:
    """Called at the start of every skill to register MCP connection.

    Updates the user's mcp_connected_at timestamp in their profile.
    """
    try:
        if not token:
            return {"status": "ok", "connected": False, "reason": "no auth context"}

        user_id = token.claims.get("sub") if token.claims else None
        access_token = token.token

        if user_id and access_token:
            from supabase import create_client as _create_client

            user_supabase = _create_client(
                settings.supabase_url,
                settings.supabase_anon_key,
            )
            user_supabase.postgrest.auth(access_token)
            user_supabase.table("profiles").update(
                {"mcp_connected_at": "now()"}
            ).eq("id", user_id).execute()

            return {"status": "ok", "user_id": user_id, "connected": True}

        return {"status": "ok", "connected": False, "reason": "no user_id in token"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# --- HTTP API routes (non-MCP) ---


async def api_skills(request: Request) -> JSONResponse:
    """Return the skills registry as JSON. Protected by API secret."""
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer ") or auth_header[7:] != settings.api_secret:
        return JSONResponse({"error": "Unauthorized"}, status_code=401)
    return JSONResponse(SKILLS_REGISTRY)


async def api_mcp_token(request: Request) -> JSONResponse:
    """Token endpoint for the OAuth proxy.

    Called by OAuthProxy's callback handler to exchange the cockpit's
    encrypted auth code for Supabase tokens, or to refresh tokens.
    """
    form = await request.form()
    grant_type = form.get("grant_type")
    client_id = form.get("client_id")
    client_secret = form.get("client_secret")

    # Validate upstream client credentials
    if client_id != "coship-internal" or client_secret != settings.api_secret:
        return JSONResponse(
            {"error": "invalid_client", "error_description": "Invalid credentials"},
            status_code=401,
        )

    if grant_type == "authorization_code":
        code = form.get("code", "")
        if not code:
            return JSONResponse(
                {"error": "invalid_request", "error_description": "Missing code"},
                status_code=400,
            )
        try:
            tokens = decrypt_auth_code(str(code), settings.api_secret)
        except ValueError as exc:
            return JSONResponse(
                {"error": "invalid_grant", "error_description": str(exc)},
                status_code=400,
            )

        # Debug: log the Supabase JWT header to check signing algorithm
        import base64 as _b64, json as _json
        try:
            _hdr_b64 = tokens["access_token"].split(".")[0]
            _hdr_b64 += "=" * (4 - len(_hdr_b64) % 4)
            _hdr = _json.loads(_b64.urlsafe_b64decode(_hdr_b64))
            logging.getLogger(__name__).warning("Supabase JWT header: %s", _hdr)
        except Exception as _e:
            logging.getLogger(__name__).warning("Could not decode JWT header: %s", _e)

        return JSONResponse({
            "access_token": tokens["access_token"],
            "token_type": "bearer",
            "expires_in": tokens.get("expires_in", 3600),
            "refresh_token": tokens.get("refresh_token"),
        })

    elif grant_type == "refresh_token":
        refresh_token = form.get("refresh_token", "")
        if not refresh_token:
            return JSONResponse(
                {"error": "invalid_request", "error_description": "Missing refresh_token"},
                status_code=400,
            )
        # Call Supabase to refresh the session
        try:
            from supabase import create_client as _create_client

            sb = _create_client(settings.supabase_url, settings.supabase_anon_key)
            result = sb.auth.refresh_session(str(refresh_token))
            session = result.session
            if not session:
                return JSONResponse(
                    {"error": "invalid_grant", "error_description": "Refresh failed"},
                    status_code=400,
                )
            return JSONResponse({
                "access_token": session.access_token,
                "token_type": "bearer",
                "expires_in": session.expires_in,
                "refresh_token": session.refresh_token,
            })
        except Exception as exc:
            return JSONResponse(
                {"error": "invalid_grant", "error_description": str(exc)},
                status_code=400,
            )

    return JSONResponse(
        {"error": "unsupported_grant_type"},
        status_code=400,
    )


def create_app():
    """Create the combined ASGI app: MCP + custom API routes."""
    from starlette.routing import Route

    mcp_app = mcp.http_app()

    # Prepend custom routes before the MCP catch-all
    mcp_app.routes.insert(0, Route("/api/skills", api_skills, methods=["GET"]))
    mcp_app.routes.insert(0, Route("/api/mcp/token", api_mcp_token, methods=["POST"]))

    return mcp_app


if __name__ == "__main__":
    import uvicorn

    app = create_app()
    uvicorn.run(app, host="127.0.0.1", port=8000)
