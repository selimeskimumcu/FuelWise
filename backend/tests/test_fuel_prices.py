from datetime import date
from decimal import Decimal

from fastapi.testclient import TestClient

from app.services.epdk_fuel import EpdkFuelProvider, PriceAggregate, parse_lpg_bulletin_response, parse_lpg_response, parse_petrol_response
from app.services.fuel_prices import resolve_province


def soap(inner: str) -> str:
    escaped = inner.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return (
        '<S:Envelope xmlns:S="http://schemas.xmlsoap.org/soap/envelope/">'
        '<S:Body><genelSorguResponse><return>' + escaped + "</return></genelSorguResponse></S:Body></S:Envelope>"
    )


def test_parses_latest_epdk_petrol_prices() -> None:
    response = soap(
        "<Result>"
        "<Row><Tarih>2026-08-05 00:00:00.0</Tarih><YakitTipi>Motorin</YakitTipi><Fiyat>50</Fiyat></Row>"
        "<Row><Tarih>2026-08-06 00:00:00.0</Tarih><YakitTipi>Motorin</YakitTipi><Fiyat>52</Fiyat></Row>"
        "<Row><Tarih>2026-08-06 00:00:00.0</Tarih><YakitTipi>Motorin (Diğer)</YakitTipi><Fiyat>54</Fiyat></Row>"
        "<Row><Tarih>2026-08-06 00:00:00.0</Tarih><YakitTipi>Kurşunsuz Benzin 95 Oktan</YakitTipi><Fiyat>53</Fiyat></Row>"
        "</Result>"
    )
    prices = parse_petrol_response(response)
    assert prices["diesel"].minimum_price == Decimal("52")
    assert prices["diesel"].average_price == Decimal("53.0")
    assert prices["diesel"].maximum_price == Decimal("54")
    assert prices["diesel"].sample_count == 2
    assert prices["diesel"].observed_at == date(2026, 8, 6)


def test_parses_only_otogaz_from_epdk_lpg_prices() -> None:
    response = soap(
        "<Results><Table>"
        "<Row><c1>Tüplü LPG 12 KG</c1><c3>1400</c3></Row>"
        "<Row><c1>Otogaz LPG</c1><c3>27.5</c3></Row>"
        "<Row><c1>Otogaz LPG</c1><c3>28.5</c3></Row>"
        "</Table></Results>"
    )
    price = parse_lpg_response(response, date(2026, 8, 6))
    assert price.minimum_price == Decimal("27.5")
    assert price.average_price == Decimal("28.0")
    assert price.maximum_price == Decimal("28.5")


def test_parses_only_litre_otogaz_from_new_epdk_daily_bulletin() -> None:
    response = """{
      "data": [
        {"Fiyat": 77.07796, "Yakıt": "Dökme LPG (Mix)", "Tarih": "2026-08-06", "Ölçü Birimi": "Kilogram"},
        {"Fiyat": 34.68, "Yakıt": "Otogaz", "Tarih": "2026-08-06", "Ölçü Birimi": "Litre"},
        {"Fiyat": 1490, "Yakıt": "Tüplü LPG", "Tarih": "2026-08-06", "Ölçü Birimi": "Adet"}
      ]
    }"""
    price = parse_lpg_bulletin_response(response)
    assert price.minimum_price == Decimal("34.68")
    assert price.average_price == Decimal("34.68")
    assert price.maximum_price == Decimal("34.68")
    assert price.sample_count == 1
    assert price.observed_at == date(2026, 8, 6)


def test_resolves_istanbul_as_two_official_service_regions() -> None:
    assert resolve_province("İstanbul") == ("34", "İstanbul", ["341", "342"])
    assert resolve_province("istanbul") == ("34", "İstanbul", ["341", "342"])


def test_fuel_price_endpoint_caches_epdk_results(client: TestClient, monkeypatch) -> None:
    calls: list[list[str]] = []

    def fake_fetch(self, service_codes: list[str]):
        calls.append(service_codes)
        return {
            fuel_type: PriceAggregate(
                fuel_type=fuel_type,
                minimum_price=Decimal(str(minimum)),
                average_price=Decimal(str(average)),
                maximum_price=Decimal(str(maximum)),
                sample_count=8,
                observed_at=date(2026, 8, 6),
            )
            for fuel_type, minimum, average, maximum in (
                ("gasoline", 52, 53, 54),
                ("diesel", 53, 54, 55),
                ("lpg", 27, 28, 29),
            )
        }

    monkeypatch.setattr(EpdkFuelProvider, "fetch", fake_fetch)
    first = client.get("/api/v1/fuel-prices?province=İstanbul")
    second = client.get("/api/v1/fuel-prices?province=34&fuel_type=diesel")

    assert first.status_code == 200
    assert len(first.json()["prices"]) == 3
    assert second.json()["prices"][0]["average_price"] == 54.0
    assert second.json()["prices"][0]["source"] == "EPDK"
    assert calls == [["341", "342"]]


def test_unknown_province_is_rejected_without_calling_epdk(client: TestClient) -> None:
    response = client.get("/api/v1/fuel-prices?province=Atlantis")
    assert response.status_code == 422
