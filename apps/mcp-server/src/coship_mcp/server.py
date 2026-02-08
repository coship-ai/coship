"""CoShip MCP Server - Main entry point.

This server provides skills for helping non-technical founders build MVPs.
Authentication uses OAuthProxy to route the authorization UI through the
cockpit (branded CoShip page) while handling DCR locally for Claude Desktop.
"""

import logging
from pathlib import Path

from mcp.types import ToolAnnotations
from fastmcp import Context, FastMCP
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


# --- Helpers for skill discovery ---

def _get_user_tier(token: AccessToken | None) -> str:
    """Extract subscription tier from JWT app_metadata."""
    if token and token.claims:
        return token.claims.get("app_metadata", {}).get("subscription_tier", "free")
    return "free"


def _available_skills():
    """Return only skills with status == 'available'."""
    return [s for s in SKILLS_REGISTRY if s["status"] == "available"]


def _build_instructions() -> str:
    """Build server instructions dynamically from the skills registry."""
    lines = [
        "CoShip is an AI co-founder that helps non-technical founders build MVPs.",
        "Start every session by calling list_user_projects so the user can choose "
        "a project, then call get_project_context to load its configuration.",
        "",
        "## Available Skills",
        "Call list_skills after authentication to get the user's personalized skill catalog.",
        "When a user's message matches a skill's triggers, call load_skill with the skill_name.",
        "",
    ]
    for skill in _available_skills():
        tier_tag = skill["tier"]
        triggers = ", ".join(skill.get("triggers", []))
        lines.append(
            f"- **{skill['name']}** [{tier_tag}] (skill_name='{skill['id']}'): "
            f"{skill['description']}"
            + (f" Triggers: {triggers}" if triggers else "")
        )
    return "\n".join(lines)

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

# Create the MCP server with dynamic instructions from skill registry
mcp = FastMCP(
    settings.server_name,
    instructions=_build_instructions(),
    auth=auth, 
)

# Add subscription tier middleware
mcp.add_middleware(SubscriptionTierMiddleware())

# Get the skills directory relative to this file
skills_root = Path(__file__).parent.parent.parent / settings.skills_dir

# Add skills provider — exposes SKILL.md files as skill:// resources
mcp.add_provider(
    SkillsDirectoryProvider(
        roots=[
            skills_root / "free",
            skills_root / "pro",
        ],
        reload=True,  # Enable hot reload in development
    )
)


# Register each available skill as an MCP prompt template
for _skill in _available_skills():
    _id = _skill["id"]
    _desc = _skill["description"]

    @mcp.prompt(name=_id, description=_desc)
    def _make_prompt(skill_id=_id) -> str:
        return f"Please call load_skill with skill_name='{skill_id}' and follow the returned instructions."


@mcp.tool(
    tags={"status"},
    annotations=ToolAnnotations(
        title="Get Subscription Info",
        readOnlyHint=True,
        idempotentHint=True,
        openWorldHint=False,
    ),
)
def get_subscription_info() -> dict:
    """Get information about the user's subscription tier and connection status."""
    return {
        "message": "Connected to CoShip MCP Server",
        "skills_available": True,
    }


@mcp.tool(
    tags={"skills"},
    annotations=ToolAnnotations(
        title="List Skills",
        readOnlyHint=True,
        idempotentHint=True,
        openWorldHint=False,
    ),
)
def list_skills(
    token: AccessToken | None = Depends(get_access_token),
) -> dict:
    """List all available CoShip skills with tier-aware access info.

    Returns each available skill with its triggers and whether the
    current user can invoke it based on their subscription tier.
    Call this after authentication to see what skills are available.
    """
    tier = _get_user_tier(token)
    catalog = []
    for skill in _available_skills():
        accessible = tier == "pro" or skill["tier"] == "free"
        entry = {
            "skill_name": skill["id"],
            "name": skill["name"],
            "tier": skill["tier"],
            "description": skill["description"],
            "triggers": skill.get("triggers", []),
            "accessible": accessible,
        }
        if not accessible:
            entry["upgrade_required"] = True
        catalog.append(entry)
    return {"status": "ok", "user_tier": tier, "skills": catalog}


def _get_user_supabase(token: AccessToken):
    """Create a user-scoped Supabase client from an access token."""
    from supabase import create_client as _create_client

    client = _create_client(settings.supabase_url, settings.supabase_anon_key)
    client.postgrest.auth(token.token)
    return client


@mcp.tool(
    tags={"project"},
    annotations=ToolAnnotations(
        title="List User Projects",
        readOnlyHint=True,
        idempotentHint=True,
        openWorldHint=True,
    ),
)
def list_user_projects(
    token: AccessToken | None = Depends(get_access_token),
) -> dict:
    """List all active projects for the current user.

    Call this first when starting skills so the user can choose which
    project to work with. Then call get_project_context with the chosen
    project_id to load configuration and matching instructions.
    """
    try:
        if not token:
            return {"status": "error", "message": "Not authenticated"}

        user_id = token.claims.get("sub") if token.claims else None
        if not user_id:
            return {"status": "error", "message": "No user_id in token"}

        sb = _get_user_supabase(token)

        result = (
            sb.table("projects")
            .select("id, name, slug, description, status")
            .eq("user_id", user_id)
            .eq("status", "active")
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "status": "ok",
            "projects": result.data or [],
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


@mcp.tool(
    tags={"project"},
    annotations=ToolAnnotations(
        title="Get Project Context",
        readOnlyHint=True,
        idempotentHint=True,
        openWorldHint=True,
    ),
)
def get_project_context(
    project_id: str | None = None,
    token: AccessToken | None = Depends(get_access_token),
) -> dict:
    """Get project context including personality configuration.

    Call this at the start of skills to understand the project and user's
    current configuration. Pass project_id to select a specific project,
    or omit it to use the most recently created active project.

    IMPORTANT: When has_personality is false, the response includes an action
    telling you to call load_skill. Do that and follow the returned instructions.
    """
    try:
        if not token:
            return {"status": "error", "message": "Not authenticated"}

        user_id = token.claims.get("sub") if token.claims else None
        if not user_id:
            return {"status": "error", "message": "No user_id in token"}

        sb = _get_user_supabase(token)

        if project_id:
            # Fetch the specific project (verify ownership)
            project_result = (
                sb.table("projects")
                .select("id, name, slug, description, status")
                .eq("id", project_id)
                .eq("user_id", user_id)
                .eq("status", "active")
                .limit(1)
                .execute()
            )
        else:
            # Fall back to most recent active project
            project_result = (
                sb.table("projects")
                .select("id, name, slug, description, status")
                .eq("user_id", user_id)
                .eq("status", "active")
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )

        if not project_result.data:
            return {
                "status": "ok",
                "has_project": False,
                "has_personality": False,
            }

        project = project_result.data[0]
        pid = project["id"]

        personality_result = (
            sb.table("project_personality")
            .select("*")
            .eq("project_id", pid)
            .limit(1)
            .execute()
        )
        personality = personality_result.data[0] if personality_result.data else None

        tier = _get_user_tier(token)
        skills_catalog = []
        for skill in _available_skills():
            accessible = tier == "pro" or skill["tier"] == "free"
            entry = {
                "skill_name": skill["id"],
                "name": skill["name"],
                "tier": skill["tier"],
                "description": skill["description"],
                "accessible": accessible,
            }
            if not accessible:
                entry["upgrade_required"] = True
            skills_catalog.append(entry)

        result = {
            "status": "ok",
            "has_project": True,
            "has_personality": personality is not None,
            "project_id": pid,
            "project_name": project["name"],
            "project_description": project.get("description"),
            "personality": personality,
            "available_skills": skills_catalog,
        }

        if not personality:
            result["action"] = (
                "Personality not configured. Call load_skill with "
                "skill_name='matching' and follow its instructions."
            )

        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}


@mcp.tool(
    tags={"skills"},
    annotations=ToolAnnotations(
        title="Load Skill",
        readOnlyHint=True,
        idempotentHint=True,
        openWorldHint=False,
    ),
)
async def load_skill(skill_name: str, ctx: Context) -> dict:
    """Load a skill's instructions by name.

    Reads the skill from the skill:// resource provider and returns
    the full instructions as markdown. Call this when a tool response
    tells you to load a skill, then follow the returned instructions
    exactly.
    """
    try:
        result = await ctx.read_resource(f"skill://{skill_name}/SKILL.md")
        content = result.contents[0].content
        # Strip YAML frontmatter
        if isinstance(content, str) and content.startswith("---"):
            _, _, content = content.split("---", 2)
            content = content.strip()
        return {"status": "ok", "skill": skill_name, "instructions": content}
    except PermissionError:
        return {
            "status": "upgrade_required",
            "skill": skill_name,
            "message": (
                f"The '{skill_name}' skill requires a Pro subscription. "
                "Upgrade at https://coship.dev/pricing"
            ),
        }
    except Exception as e:
        return {"status": "error", "message": f"Skill '{skill_name}' not found: {e}"}


@mcp.tool(
    tags={"project", "configuration"},
    annotations=ToolAnnotations(
        title="Save Project Personality",
        readOnlyHint=False,
        destructiveHint=False,
        idempotentHint=True,
        openWorldHint=True,
    ),
)
def save_project_personality(
    project_id: str,
    challenge_level: str,
    transparency_level: str,
    ux_design_model: str,
    development_approach: str,
    documentation_level: str = "minimal",
    project_summary: str | None = None,
    token: AccessToken | None = Depends(get_access_token),
) -> dict:
    """Save Ship's personality traits for a project.

    Upserts challenge_level, transparency_level, ux_design_model,
    development_approach, documentation_level, and project_summary
    into project_personality.
    """
    try:
        if not token:
            return {"status": "error", "message": "Not authenticated"}

        user_id = token.claims.get("sub") if token.claims else None
        if not user_id:
            return {"status": "error", "message": "No user_id in token"}

        sb = _get_user_supabase(token)

        # Verify project ownership
        proj = (
            sb.table("projects")
            .select("id")
            .eq("id", project_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not proj.data:
            return {"status": "error", "message": "Project not found or not owned by user"}

        row = {
            "project_id": project_id,
            "challenge_level": challenge_level,
            "transparency_level": transparency_level,
            "ux_design_model": ux_design_model,
            "development_approach": development_approach,
            "documentation_level": documentation_level,
            "project_summary": project_summary,
        }

        sb.table("project_personality").upsert(
            row, on_conflict="project_id"
        ).execute()

        return {"status": "ok", "saved": True}
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
