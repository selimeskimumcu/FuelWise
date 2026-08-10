from fastapi.testclient import TestClient


def create_account_and_login(client: TestClient, username: str = "driver") -> None:
    password = "FuelWise123"
    client.post(
        "/api/v1/auth/register",
        json={"full_name": "Test Driver", "username": username, "email": f"{username}@example.com", "password": password},
    )
    response = client.post("/api/v1/auth/login", json={"identifier": username, "password": password})
    assert response.status_code == 200


def vehicle_payload(name: str = "Honda Forza 250") -> dict:
    return {
        "name": name,
        "make": "Honda",
        "model": "Forza 250",
        "year": 2025,
        "vehicle_type": "motorcycle",
        "fuel_type": "gasoline",
        "consumption": 3.4,
        "tank_capacity": 11.7,
    }


def test_vehicle_endpoints_require_authentication(client: TestClient) -> None:
    assert client.get("/api/v1/vehicles").status_code == 401
    assert client.post("/api/v1/vehicles", json=vehicle_payload()).status_code == 401


def test_create_and_list_vehicle(client: TestClient) -> None:
    create_account_and_login(client)
    created = client.post("/api/v1/vehicles", json=vehicle_payload())
    assert created.status_code == 201
    assert created.json()["is_default"] is True

    vehicles = client.get("/api/v1/vehicles")
    assert vehicles.status_code == 200
    assert len(vehicles.json()) == 1
    assert vehicles.json()[0]["name"] == "Honda Forza 250"


def test_update_and_set_default_vehicle(client: TestClient) -> None:
    create_account_and_login(client)
    first = client.post("/api/v1/vehicles", json=vehicle_payload()).json()
    second = client.post("/api/v1/vehicles", json=vehicle_payload("BMW 320i")).json()

    updated = client.patch(f"/api/v1/vehicles/{second['id']}", json={"consumption": 7.1, "tank_capacity": 59})
    assert updated.status_code == 200
    assert updated.json()["consumption"] == 7.1

    defaulted = client.patch(f"/api/v1/vehicles/{second['id']}/default")
    assert defaulted.status_code == 200
    vehicles = client.get("/api/v1/vehicles").json()
    assert vehicles[0]["id"] == second["id"]
    assert next(item for item in vehicles if item["id"] == first["id"])["is_default"] is False


def test_delete_default_promotes_remaining_vehicle(client: TestClient) -> None:
    create_account_and_login(client)
    first = client.post("/api/v1/vehicles", json=vehicle_payload()).json()
    second = client.post("/api/v1/vehicles", json=vehicle_payload("Honda CL250")).json()

    assert client.delete(f"/api/v1/vehicles/{first['id']}").status_code == 204
    remaining = client.get("/api/v1/vehicles").json()
    assert len(remaining) == 1
    assert remaining[0]["id"] == second["id"]
    assert remaining[0]["is_default"] is True


def test_user_cannot_access_another_users_vehicle(client: TestClient) -> None:
    create_account_and_login(client, "first")
    vehicle_id = client.post("/api/v1/vehicles", json=vehicle_payload()).json()["id"]
    client.post("/api/v1/auth/logout")

    create_account_and_login(client, "second")
    assert client.get(f"/api/v1/vehicles/{vehicle_id}").status_code == 404
    assert client.patch(f"/api/v1/vehicles/{vehicle_id}", json={"name": "Stolen"}).status_code == 404
    assert client.delete(f"/api/v1/vehicles/{vehicle_id}").status_code == 404


def test_invalid_vehicle_values_are_rejected(client: TestClient) -> None:
    create_account_and_login(client)
    payload = {**vehicle_payload(), "consumption": 0, "tank_capacity": -1}
    assert client.post("/api/v1/vehicles", json=payload).status_code == 422


def test_supported_commercial_vehicle_types(client: TestClient) -> None:
    create_account_and_login(client)
    for vehicle_type in ("car", "motorcycle", "truck", "bus", "semi_truck"):
        payload = {**vehicle_payload(vehicle_type), "vehicle_type": vehicle_type}
        assert client.post("/api/v1/vehicles", json=payload).status_code == 201

    unsupported = {**vehicle_payload("Scooter"), "vehicle_type": "scooter"}
    assert client.post("/api/v1/vehicles", json=unsupported).status_code == 422
