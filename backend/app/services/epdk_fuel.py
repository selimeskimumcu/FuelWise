from __future__ import annotations

import html
import json
import statistics
import unicodedata
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from xml.etree import ElementTree as ET

import httpx


SOAP_NAMESPACE = "http://schemas.xmlsoap.org/soap/envelope/"
SERVICE_NAMESPACE = "http://genel.service.ws.epvys.g222.tubitak.gov.tr/"
PETROL_ENDPOINT = "https://lisansws.epdk.gov.tr/services/bildirimPetrolAkaryakitFiyatlari"
LPG_ENDPOINT = "https://lisansws.epdk.gov.tr/services/bildirimLPGTarife"
LPG_BULLETIN_ENDPOINT = "https://apigateway.epdk.gov.tr/lpgBayiSatisFiyatBultenGunluk/"
SOURCE_URL = "https://www.epdk.gov.tr/Detay/Icerik/3-0-158/akaryak"


@dataclass(frozen=True)
class PriceAggregate:
    fuel_type: str
    minimum_price: Decimal
    average_price: Decimal
    maximum_price: Decimal
    sample_count: int
    observed_at: date


def _soap_body(query_number: int, parameters: list[str]) -> str:
    parameter_xml = "".join(f"<parametreler>{html.escape(value)}</parametreler>" for value in parameters)
    return (
        f'<soapenv:Envelope xmlns:soapenv="{SOAP_NAMESPACE}" xmlns:gen="{SERVICE_NAMESPACE}">'
        "<soapenv:Header/><soapenv:Body><gen:genelSorgu>"
        f"<sorguNo>{query_number}</sorguNo>{parameter_xml}"
        "</gen:genelSorgu></soapenv:Body></soapenv:Envelope>"
    )


def _inner_xml(response_text: str) -> ET.Element:
    envelope = ET.fromstring(response_text)
    return_node = next((node for node in envelope.iter() if node.tag.rsplit("}", 1)[-1] == "return"), None)
    if return_node is None or not return_node.text:
        raise ValueError("EPDK response did not contain price data.")
    # Parsing the SOAP envelope already removes the outer XML escaping. A second
    # HTML-unescape would turn valid company names containing &amp; into invalid XML.
    return ET.fromstring(return_node.text.strip())


def _plain(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value.casefold())
    return "".join(character for character in normalized if not unicodedata.combining(character))


def parse_petrol_response(response_text: str) -> dict[str, PriceAggregate]:
    root = _inner_xml(response_text)
    records: dict[str, list[tuple[date, Decimal]]] = {"gasoline": [], "diesel": []}
    for row in root:
        values = {child.tag.rsplit("}", 1)[-1]: (child.text or "").strip() for child in row}
        fuel_name = _plain(values.get("YakitTipi", ""))
        fuel_type = "gasoline" if "benzin" in fuel_name else "diesel" if "motorin" in fuel_name else None
        if fuel_type is None:
            continue
        try:
            observed = datetime.strptime(values["Tarih"].split(".")[0], "%Y-%m-%d %H:%M:%S").date()
            price = Decimal(values["Fiyat"])
        except (KeyError, ValueError):
            continue
        if price > 0:
            records[fuel_type].append((observed, price))
    return {fuel_type: _aggregate_latest(fuel_type, values) for fuel_type, values in records.items() if values}


def parse_lpg_response(response_text: str, observed_at: date) -> PriceAggregate:
    root = _inner_xml(response_text)
    values: list[tuple[date, Decimal]] = []
    for row in root.findall(".//Row"):
        fuel_name = _plain(row.findtext("c1", default=""))
        if "otogaz" not in fuel_name:
            continue
        try:
            price = Decimal(row.findtext("c3", default="0"))
        except ValueError:
            continue
        if price > 0:
            values.append((observed_at, price))
    if not values:
        raise ValueError("EPDK LPG response did not contain Otogaz prices.")
    return _aggregate_latest("lpg", values)


def parse_lpg_bulletin_response(response_text: str) -> PriceAggregate:
    payload = json.loads(response_text)
    values: list[tuple[date, Decimal]] = []
    for row in payload.get("data", []):
        fuel_name = _plain(str(row.get("Yakıt", "")))
        unit = _plain(str(row.get("Ölçü Birimi", "")))
        if fuel_name != "otogaz" or unit != "litre":
            continue
        try:
            observed_at = date.fromisoformat(str(row["Tarih"]))
            price = Decimal(str(row["Fiyat"]))
        except (KeyError, ValueError):
            continue
        if price > 0:
            values.append((observed_at, price))
    if not values:
        raise ValueError("EPDK LPG bulletin did not contain a litre-based Otogaz price.")
    return _aggregate_latest("lpg", values)


def _aggregate_latest(fuel_type: str, records: list[tuple[date, Decimal]]) -> PriceAggregate:
    latest_date = max(item[0] for item in records)
    prices = [item[1] for item in records if item[0] == latest_date]
    return PriceAggregate(
        fuel_type=fuel_type,
        minimum_price=min(prices),
        average_price=Decimal(str(statistics.fmean(prices))),
        maximum_price=max(prices),
        sample_count=len(prices),
        observed_at=latest_date,
    )


def _combine(fuel_type: str, aggregates: list[PriceAggregate]) -> PriceAggregate:
    latest_date = max(item.observed_at for item in aggregates)
    latest = [item for item in aggregates if item.observed_at == latest_date]
    sample_count = sum(item.sample_count for item in latest)
    weighted_total = sum((item.average_price * item.sample_count for item in latest), start=Decimal("0"))
    return PriceAggregate(
        fuel_type=fuel_type,
        minimum_price=min(item.minimum_price for item in latest),
        average_price=weighted_total / sample_count,
        maximum_price=max(item.maximum_price for item in latest),
        sample_count=sample_count,
        observed_at=latest_date,
    )


class EpdkFuelProvider:
    def __init__(self, timeout_seconds: float = 35.0) -> None:
        self.timeout_seconds = timeout_seconds

    def _request(self, endpoint: str, query_number: int, parameters: list[str]) -> str:
        with httpx.Client(timeout=self.timeout_seconds, trust_env=False) as client:
            response = client.post(
                endpoint,
                content=_soap_body(query_number, parameters).encode("utf-8"),
                headers={"Content-Type": "text/xml; charset=utf-8", "SOAPAction": "genelSorgu"},
            )
        response.raise_for_status()
        return response.text

    def _request_lpg_bulletin(self, observed_at: date) -> str:
        with httpx.Client(timeout=self.timeout_seconds, trust_env=False) as client:
            response = client.request(
                "GET",
                LPG_BULLETIN_ENDPOINT,
                content=json.dumps({"raporTarihi": observed_at.strftime("%d.%m.%Y")}).encode("utf-8"),
                headers={"Content-Type": "application/json"},
            )
        response.raise_for_status()
        return response.text

    def fetch(self, service_codes: list[str]) -> dict[str, PriceAggregate]:
        petrol_aggregates: dict[str, list[PriceAggregate]] = {"gasoline": [], "diesel": []}
        for code in service_codes:
            parsed = parse_petrol_response(self._request(PETROL_ENDPOINT, 72, [code]))
            for fuel_type, aggregate in parsed.items():
                petrol_aggregates[fuel_type].append(aggregate)

        result = {
            fuel_type: _combine(fuel_type, aggregates)
            for fuel_type, aggregates in petrol_aggregates.items()
            if aggregates
        }

        lpg_aggregates: list[PriceAggregate] = []
        latest_petrol_date = max((item.observed_at for item in result.values()), default=datetime.now(timezone.utc).date())
        for code in service_codes:
            try:
                aggregate = parse_lpg_response(
                    self._request(LPG_ENDPOINT, 54, [latest_petrol_date.strftime("%d/%m/%Y"), code]),
                    latest_petrol_date,
                )
                lpg_aggregates.append(aggregate)
            except ValueError:
                continue
        if lpg_aggregates:
            result["lpg"] = _combine("lpg", lpg_aggregates)
        elif any(code in {"341", "342"} for code in service_codes):
            # The legacy province service can be empty for Istanbul. EPDK's
            # official daily bulletin publishes the Istanbul-European-side
            # Otogaz litre average and is the authoritative fallback there.
            for days_ago in range(0, 8):
                bulletin_date = latest_petrol_date - timedelta(days=days_ago)
                try:
                    result["lpg"] = parse_lpg_bulletin_response(self._request_lpg_bulletin(bulletin_date))
                    break
                except (httpx.HTTPError, ValueError):
                    continue
        return result
