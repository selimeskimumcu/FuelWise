from fastapi.testclient import TestClient

from app.api import auth as auth_api


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
