from fastapi.testclient import TestClient


REGISTER_PAYLOAD = {
    "full_name": "Selim Eskimumcu",
    "username": "selim",
    "email": "selim@example.com",
    "password": "FuelWise123",
}


def register_user(client: TestClient):
    return client.post("/api/v1/auth/register", json=REGISTER_PAYLOAD)


def login_user(client: TestClient):
    return client.post(
        "/api/v1/auth/login",
        json={"identifier": REGISTER_PAYLOAD["email"], "password": REGISTER_PAYLOAD["password"]},
    )


def test_register_user(client: TestClient) -> None:
    response = register_user(client)
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "selim"
    assert body["email"] == "selim@example.com"
    assert "password" not in body
    assert "password_hash" not in body


def test_register_rejects_duplicate_email_or_username(client: TestClient) -> None:
    assert register_user(client).status_code == 201
    response = register_user(client)
    assert response.status_code == 409


def test_register_rejects_weak_password(client: TestClient) -> None:
    payload = {**REGISTER_PAYLOAD, "password": "weakpass"}
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_sets_secure_session_cookies_and_me_returns_user(client: TestClient) -> None:
    register_user(client)
    response = login_user(client)
    assert response.status_code == 200
    assert response.cookies.get("access_token")
    assert response.cookies.get("refresh_token")
    cookie_headers = response.headers.get_list("set-cookie")
    assert all("HttpOnly" in header and "SameSite=lax" in header for header in cookie_headers)

    profile = client.get("/api/v1/auth/me")
    assert profile.status_code == 200
    assert profile.json()["username"] == "selim"


def test_login_rejects_invalid_password(client: TestClient) -> None:
    register_user(client)
    response = client.post(
        "/api/v1/auth/login",
        json={"identifier": "selim", "password": "WrongPassword1"},
    )
    assert response.status_code == 401


def test_refresh_rotates_session_and_logout_revokes_it(client: TestClient) -> None:
    register_user(client)
    login = login_user(client)
    old_refresh = login.cookies.get("refresh_token")

    refreshed = client.post("/api/v1/auth/refresh")
    assert refreshed.status_code == 200
    assert refreshed.cookies.get("refresh_token") != old_refresh

    logout = client.post("/api/v1/auth/logout")
    assert logout.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_frontend_is_served_by_api(client: TestClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "FuelWise" in response.text


def test_security_headers_are_added(client: TestClient) -> None:
    response = client.get("/health")

    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
    assert response.headers["referrer-policy"] == "strict-origin-when-cross-origin"
    assert response.headers["permissions-policy"] == "camera=(), microphone=(), geolocation=(self)"
    assert "frame-ancestors 'none'" in response.headers["content-security-policy"]
    assert len(response.headers["x-request-id"]) == 32


def test_cors_allows_configured_origin_only(client: TestClient) -> None:
    allowed = client.options(
        "/api/v1/auth/login",
        headers={"Origin": "http://127.0.0.1:5500", "Access-Control-Request-Method": "POST"},
    )
    denied = client.options(
        "/api/v1/auth/login",
        headers={"Origin": "https://attacker.example", "Access-Control-Request-Method": "POST"},
    )

    assert allowed.headers["access-control-allow-origin"] == "http://127.0.0.1:5500"
    assert "access-control-allow-origin" not in denied.headers
