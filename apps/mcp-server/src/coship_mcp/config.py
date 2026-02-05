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

    # Skills Configuration
    skills_dir: str = "skills"


settings = Settings()
