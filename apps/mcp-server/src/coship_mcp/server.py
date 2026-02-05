"""CoShip MCP Server - Main entry point.

This server provides skills for helping non-technical founders build MVPs.
Authentication is handled via Supabase, with subscription tier gating.
"""

import os
from pathlib import Path

from fastmcp import FastMCP
from fastmcp.server.auth.providers.supabase import SupabaseProvider
from fastmcp.server.providers.skills import SkillsDirectoryProvider

from coship_mcp.config import settings
from coship_mcp.middleware import SubscriptionTierMiddleware

# Setup authentication (disabled in dev mode for local testing)
auth = SupabaseProvider(
        project_url=settings.supabase_url,
        base_url=settings.server_base_url,
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


if __name__ == "__main__":
    mcp.run(transport="http", port=8000)
