from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FuelWise API"
    environment: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://fuelwise:fuelwise_dev_password@localhost:5433/fuelwise"
    jwt_secret_key: str = "development-only-change-this-secret"
    access_token_minutes: int = 15
    refresh_token_days: int = 30
    cookie_secure: bool = False
    cookie_samesite: Literal["lax", "strict", "none"] = "lax"
    cookie_domain: str | None = None
    allowed_origins: str = "http://127.0.0.1:5500,http://localhost:5500"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "fuelwise.support@gmail.com"
    smtp_starttls: bool = True
    password_reset_code_minutes: int = 10
    password_reset_max_attempts: int = 5
    password_reset_request_cooldown_seconds: int = 60
    rate_limit_enabled: bool = True
    rate_limit_trust_proxy_headers: bool = False
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @model_validator(mode="after")
    def validate_production_security(self) -> "Settings":
        if self.environment != "production":
            return self

        errors: list[str] = []
        weak_secrets = {
            "development-only-change-this-secret",
            "replace-with-a-long-random-secret-before-production",
        }
        if len(self.jwt_secret_key) < 48 or self.jwt_secret_key in weak_secrets:
            errors.append("JWT_SECRET_KEY must be a unique random value of at least 48 characters")
        if not self.cookie_secure:
            errors.append("COOKIE_SECURE must be true")
        if self.cookie_samesite == "none" and not self.cookie_secure:
            errors.append("SameSite=None cookies require COOKIE_SECURE=true")
        if not self.allowed_origins_list or any(
            origin == "*" or not origin.startswith("https://") for origin in self.allowed_origins_list
        ):
            errors.append("ALLOWED_ORIGINS must contain only explicit HTTPS origins")
        if "fuelwise_dev_password" in self.database_url:
            errors.append("DATABASE_URL must not use the development database password")
        if not self.smtp_username or not self.smtp_password:
            errors.append("SMTP credentials are required")
        if errors:
            raise ValueError("Unsafe production configuration: " + "; ".join(errors))
        return self

    @property
    def allowed_origins_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]

    @property
    def auth_cookie_options(self) -> dict[str, object]:
        options: dict[str, object] = {
            "httponly": True,
            "secure": self.cookie_secure,
            "samesite": self.cookie_samesite,
            "path": "/",
        }
        if self.cookie_domain:
            options["domain"] = self.cookie_domain
        return options


@lru_cache
def get_settings() -> Settings:
    return Settings()
