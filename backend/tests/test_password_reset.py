from fastapi.testclient import TestClient

from app.services import password_reset as password_reset_service


def register(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/register",
        json={"full_name": "Reset User", "username": "resetuser", "email": "reset@example.com", "password": "OldPassword1"},
    )
    assert response.status_code == 201


def test_complete_password_reset_is_single_use_and_revokes_sessions(client: TestClient, monkeypatch) -> None:
    register(client)
    assert client.post("/api/v1/auth/login", json={"identifier": "resetuser", "password": "OldPassword1"}).status_code == 200
    sent: dict[str, str] = {}
    monkeypatch.setattr(password_reset_service, "send_password_reset_email", lambda recipient, code: sent.update(recipient=recipient, code=code))

    requested = client.post("/api/v1/auth/password-reset/request", json={"email": "reset@example.com"})
    assert requested.status_code == 200
    assert requested.json()["message"] == "If this email is registered, a verification code has been sent."
    assert sent["recipient"] == "reset@example.com"
    assert len(sent["code"]) == 6

    verified = client.post(
        "/api/v1/auth/password-reset/verify",
        json={"email": "reset@example.com", "code": sent["code"]},
    )
    assert verified.status_code == 200
    token = verified.json()["reset_token"]

    confirmed = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"reset_token": token, "password": "NewPassword2"},
    )
    assert confirmed.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.post("/api/v1/auth/login", json={"identifier": "resetuser", "password": "OldPassword1"}).status_code == 401
    assert client.post("/api/v1/auth/login", json={"identifier": "resetuser", "password": "NewPassword2"}).status_code == 200
    assert client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"reset_token": token, "password": "AnotherPassword3"},
    ).status_code == 400


def test_reset_request_does_not_reveal_unknown_email(client: TestClient, monkeypatch) -> None:
    sent: list[str] = []
    monkeypatch.setattr(password_reset_service, "send_password_reset_email", lambda recipient, code: sent.append(recipient))
    response = client.post("/api/v1/auth/password-reset/request", json={"email": "unknown@example.com"})
    assert response.status_code == 200
    assert sent == []


def test_invalid_code_is_rejected(client: TestClient, monkeypatch) -> None:
    register(client)
    monkeypatch.setattr(password_reset_service, "send_password_reset_email", lambda recipient, code: None)
    client.post("/api/v1/auth/password-reset/request", json={"email": "reset@example.com"})
    response = client.post("/api/v1/auth/password-reset/verify", json={"email": "reset@example.com", "code": "000000"})
    assert response.status_code == 400


def test_new_password_strength_is_required(client: TestClient) -> None:
    response = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"reset_token": "x" * 48, "password": "weakpass"},
    )
    assert response.status_code == 422
