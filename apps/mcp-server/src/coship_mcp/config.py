"""Configuration settings for CoShip MCP Server."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Server configuration loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_prefix="COSHIP_",
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str | None = None

    # Server Configuration
    server_base_url: str = "http://localhost:8000"
    server_name: str = "CoShip MCP Server"
    dev_mode: bool = True  # Disable OAuth auth for local development

    # API Secret (shared between cockpit and MCP server)
    api_secret: str = ""

    # Cockpit URL (for OAuth authorization UI)
    cockpit_url: str = "http://localhost:3000"

    @property
    def server_base_url_clean(self) -> str:
        return self.server_base_url.rstrip("/")

    @property
    def cockpit_url_clean(self) -> str:
        return self.cockpit_url.rstrip("/")

    # Skills Configuration
    skills_dir: str = "skills"


settings = Settings()
