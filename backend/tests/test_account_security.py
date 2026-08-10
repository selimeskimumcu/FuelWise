from fastapi.testclient import TestClient

from app.services import account_security


def register_and_login(client: TestClient, username: str = "secureuser") -> None:
    password = "OldPassword1"
    email = f"{username}@example.com"
    assert client.post("/api/v1/auth/register", json={"full_name": "Secure User", "username": username, "email": email, "password": password}).status_code == 201
    assert client.post("/api/v1/auth/login", json={"identifier": username, "password": password}).status_code == 200


def test_authenticated_password_change_requires_emailed_code(client: TestClient, monkeypatch) -> None:
    register_and_login(client)
    sent = {}
    monkeypatch.setattr(account_security, "send_verification_email", lambda recipient, code, purpose: sent.update(code=code, purpose=purpose))
    assert client.post("/api/v1/auth/account/action-code/request", json={"action": "change_password"}).status_code == 200
    assert sent["purpose"] == "change_password"
    verified = client.post("/api/v1/auth/account/action-code/verify", json={"action": "change_password", "code": sent["code"]})
    assert verified.status_code == 200
    token = verified.json()["action_token"]
    assert client.post("/api/v1/auth/account/change-password", json={"action_token": token, "password": "NewPassword2"}).status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.post("/api/v1/auth/login", json={"identifier": "secureuser", "password": "NewPassword2"}).status_code == 200


def test_delete_code_cannot_be_used_to_change_password(client: TestClient, monkeypatch) -> None:
    register_and_login(client, "purposeuser")
    sent = {}
    monkeypatch.setattr(account_security, "send_verification_email", lambda recipient, code, purpose: sent.update(code=code))
    client.post("/api/v1/auth/account/action-code/request", json={"action": "delete_account"})
    wrong_purpose = client.post("/api/v1/auth/account/action-code/verify", json={"action": "change_password", "code": sent["code"]})
    assert wrong_purpose.status_code == 400


def test_account_deletion_removes_user_and_session(client: TestClient, monkeypatch) -> None:
    register_and_login(client, "deleteuser")
    sent = {}
    monkeypatch.setattr(account_security, "send_verification_email", lambda recipient, code, purpose: sent.update(code=code))
    client.post("/api/v1/auth/account/action-code/request", json={"action": "delete_account"})
    verified = client.post("/api/v1/auth/account/action-code/verify", json={"action": "delete_account", "code": sent["code"]})
    deleted = client.post("/api/v1/auth/account/delete", json={"action_token": verified.json()["action_token"]})
    assert deleted.status_code == 200
    assert client.get("/api/v1/auth/me").status_code == 401
    assert client.post("/api/v1/auth/login", json={"identifier": "deleteuser", "password": "OldPassword1"}).status_code == 401


def test_account_action_endpoints_require_authentication(client: TestClient) -> None:
    assert client.post("/api/v1/auth/account/action-code/request", json={"action": "delete_account"}).status_code == 401
