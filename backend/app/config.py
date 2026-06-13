"""Application configuration using Pydantic Settings v2."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration loaded from environment variables / .env file.

    Attributes:
        DATABASE_URL: Async PostgreSQL connection string
            (e.g. ``postgresql+asyncpg://user:pass@host:5432/db``).
        CORS_ORIGINS: Allowed CORS origins for the API.
        APP_NAME: Human-readable application name.
        DEBUG: Enable debug mode (verbose logging, etc.).
    """

    DATABASE_URL: str  # Required — must be set via .env or environment variable
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]
    APP_NAME: str = "Inventory & Order Management"
    DEBUG: bool = False

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url


    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        # If .env is missing, Pydantic Settings v2 silently falls back to
        # environment variables / defaults – no crash.
        env_ignore_empty=True,
        case_sensitive=False,
    )


settings = Settings()
