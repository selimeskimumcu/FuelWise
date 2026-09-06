from fastapi.testclient import TestClient

from app.api import auth as auth_api
from app.core.config import get_settings


def test_login_is_limited_per_account(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(auth_api, "authenticate_user", lambda db, identifier, password: None)
    payload = {"identifier": "target@example.com", "password": "WrongPassword1"}
    for _ in range(10):
        assert client.post("/api/v1/auth/login", json=payload).status_code == 401

    response = client.post("/api/v1/auth/login", json=payload)

    assert response.status_code == 429
    assert int(response.headers["retry-after"]) > 0


def test_password_reset_requests_are_limited_without_revealing_account(client: TestClient) -> None:
    payload = {"email": "unknown@example.com"}
    for _ in range(3):
        assert client.post("/api/v1/auth/password-reset/request", json=payload).status_code == 200

    response = client.post("/api/v1/auth/password-reset/request", json=payload)

    assert response.status_code == 429
    assert response.json()["detail"] == "Too many requests. Please try again later."


def test_spoofed_forwarded_for_cannot_bypass_the_ip_limit(client: TestClient, monkeypatch) -> None:
    monkeypatch.setattr(get_settings(), "rate_limit_trust_proxy_headers", True)
    monkeypatch.setattr(auth_api, "authenticate_user", lambda db, identifier, password: None)

    def attempt(index: int):
        # A forged entry ahead of the address the proxy actually observed.
        return client.post(
            "/api/v1/auth/login",
            headers={"X-Forwarded-For": f"9.9.9.{index}, 172.18.0.5"},
            json={"identifier": f"ghost{index}@example.com", "password": "WrongPassword1"},
        )

    # Unique identifiers keep the per-account limit from masking the per-IP one.
    for index in range(20):
        assert attempt(index).status_code == 401

    assert attempt(20).status_code == 429
