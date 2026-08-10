import pytest
from pydantic import ValidationError

from app.core.config import Settings


def production_settings(**overrides) -> Settings:
    values = {
        "environment": "production",
        "database_url": "postgresql+psycopg://fuelwise:unique-production-password@db:5432/fuelwise",
        "jwt_secret_key": "a-unique-production-secret-that-is-longer-than-forty-eight-characters",
        "cookie_secure": True,
        "allowed_origins": "https://fuelwise.example",
        "smtp_username": "mailer@fuelwise.example",
        "smtp_password": "secret-from-hosting-provider",
    }
    values.update(overrides)
    return Settings(_env_file=None, **values)


def test_production_rejects_insecure_defaults() -> None:
    with pytest.raises(ValidationError, match="Unsafe production configuration"):
        Settings(environment="production", _env_file=None)


def test_production_accepts_explicit_secure_configuration() -> None:
    settings = production_settings()

    assert settings.cookie_secure is True
    assert settings.allowed_origins_list == ["https://fuelwise.example"]
    assert settings.auth_cookie_options["httponly"] is True


@pytest.mark.parametrize("origin", ["*", "http://fuelwise.example"])
def test_production_rejects_wildcard_or_http_origins(origin: str) -> None:
    with pytest.raises(ValidationError, match="explicit HTTPS origins"):
        production_settings(allowed_origins=origin)
