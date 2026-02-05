"""Subscription tier middleware for gating skills by subscription level."""

from fastmcp.server.middleware import Middleware, MiddlewareContext


class SubscriptionTierMiddleware(Middleware):
    """Middleware that filters skills based on user subscription tier.

    The subscription tier is extracted from the JWT app_metadata.
    Skills are loaded via SkillsDirectoryProvider from:
    - skills/free/ - Available to all users
    - skills/pro/  - Requires pro subscription

    The provider exposes skills as skill://<skill-name>/SKILL.md URIs.
    We determine tier by checking which directory the skill came from.
    """

    # Map skill names to their tiers (populated at startup or checked dynamically)
    PRO_SKILLS = {"code-review", "deployment"}

    def _get_tier_from_context(self, context: MiddlewareContext) -> str:
        """Extract subscription tier from request context.

        The tier is stored in JWT app_metadata.subscription_tier,
        synced via Supabase database trigger.
        """
        try:
            # Access the auth context from FastMCP
            if hasattr(context, "auth_context") and context.auth_context:
                token = context.auth_context
                if hasattr(token, "claims"):
                    app_metadata = token.claims.get("app_metadata", {})
                    return app_metadata.get("subscription_tier", "free")
        except Exception:
            pass
        return "free"

    def _is_skill_allowed(self, uri: str, tier: str) -> bool:
        """Check if a skill is allowed for the given tier.

        Tier hierarchy:
        - free: can access free skills only
        - pro: can access all skills
        """
        # Extract skill name from URI like "skill://code-review/SKILL.md"
        if not uri.startswith("skill://"):
            return True  # Not a skill resource, allow

        # Parse skill name from URI
        path = uri.replace("skill://", "")
        skill_name = path.split("/")[0] if "/" in path else path

        # Pro users can access everything
        if tier == "pro":
            return True

        # Free users can only access non-pro skills
        return skill_name not in self.PRO_SKILLS

    async def on_request(
        self,
        context: MiddlewareContext,
        call_next,
    ):
        """Check resource access on read requests."""
        # Check if this is a resources/read request
        if context.method == "resources/read":
            tier = self._get_tier_from_context(context)
            params = context.message.params or {}
            uri = str(params.get("uri", ""))

            if not self._is_skill_allowed(uri, tier):
                raise PermissionError(
                    f"Access denied: '{uri}' requires a Pro subscription. "
                    f"Your current tier: {tier}. Upgrade at https://coship.dev/pricing"
                )

        return await call_next(context)
