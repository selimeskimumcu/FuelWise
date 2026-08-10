from fastapi.testclient import TestClient


def login(client: TestClient, username: str = "tripdriver") -> None:
    password = "FuelWise123"
    client.post("/api/v1/auth/register", json={"full_name": "Trip Driver", "username": username, "email": f"{username}@example.com", "password": password})
    assert client.post("/api/v1/auth/login", json={"identifier": username, "password": password}).status_code == 200


def payload(distance: float = 483) -> dict:
    return {"vehicle_name": "Honda Forza", "origin": "Kadıköy / İstanbul", "destination": "Konak / İzmir", "trip_type": "one-way", "distance": distance, "consumption": 3.5, "tank_capacity": 12, "fuel_price": 52}


def test_trip_history_requires_authentication_but_calculation_does_not(client: TestClient) -> None:
    assert client.get("/api/v1/trips").status_code == 401
    calculated = client.post("/api/v1/trips/calculate", json=payload())
    assert calculated.status_code == 200
    assert calculated.json()["saved"] is False
    assert calculated.json()["total_distance"] == 483


def test_create_and_list_latest_three_trips(client: TestClient) -> None:
    login(client)
    for distance in (100, 200, 300, 400):
        result = client.post("/api/v1/trips/calculate", json=payload(distance))
        assert result.status_code == 200
        assert result.json()["saved"] is True
    history = client.get("/api/v1/trips?limit=3")
    assert history.status_code == 200
    assert len(history.json()) == 3


def test_trip_history_is_private(client: TestClient) -> None:
    login(client, "tripfirst")
    client.post("/api/v1/trips/calculate", json=payload())
    client.post("/api/v1/auth/logout")
    login(client, "tripsecond")
    assert client.get("/api/v1/trips").json() == []


def test_backend_calculates_round_trip_and_rejects_client_results(client: TestClient) -> None:
    request = {**payload(500), "trip_type": "round-trip"}
    result = client.post("/api/v1/trips/calculate", json=request)
    assert result.status_code == 200
    body = result.json()
    assert body["total_distance"] == 1000
    assert body["min_fuel_required"] == 35.22
    assert body["max_fuel_required"] == 39.55
    assert body["min_total_cost"] == 1831.65
    assert body["max_total_cost"] == 2056.6
    assert body["estimated_range"] == 342.86
    assert body["min_fuel_stops"] == 2
    assert body["max_fuel_stops"] == 3
    assert client.post("/api/v1/trips/calculate", json={**request, "total_cost": 1}).status_code == 422


def test_traffic_conditions_increase_only_the_modeled_urban_effect(client: TestClient) -> None:
    maximums = []
    for condition in ("flowing", "normal", "heavy", "very-heavy"):
        response = client.post("/api/v1/trips/calculate", json={**payload(600), "traffic_condition": condition})
        assert response.status_code == 200
        maximums.append(response.json()["max_fuel_required"])
    assert maximums == sorted(maximums)
    assert len(set(maximums)) == 4


def test_invalid_traffic_condition_is_rejected(client: TestClient) -> None:
    assert client.post("/api/v1/trips/calculate", json={**payload(), "traffic_condition": "impossible"}).status_code == 422


def test_calculation_uses_epdk_minimum_and_maximum_price_range(client: TestClient) -> None:
    result = client.post(
        "/api/v1/trips/calculate",
        json={**payload(100), "minimum_fuel_price": 50, "fuel_price": 52, "maximum_fuel_price": 55},
    )
    assert result.status_code == 200
    body = result.json()
    average_only = client.post("/api/v1/trips/calculate", json=payload(100)).json()
    assert body["min_total_cost"] < average_only["min_total_cost"]
    assert body["max_total_cost"] > average_only["max_total_cost"]
