from __future__ import annotations

import unicodedata
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import FuelPrice
from app.services.epdk_fuel import EpdkFuelProvider


PROVINCES = "Adana,Adıyaman,Afyonkarahisar,Ağrı,Amasya,Ankara,Antalya,Artvin,Aydın,Balıkesir,Bilecik,Bingöl,Bitlis,Bolu,Burdur,Bursa,Çanakkale,Çankırı,Çorum,Denizli,Diyarbakır,Edirne,Elazığ,Erzincan,Erzurum,Eskişehir,Gaziantep,Giresun,Gümüşhane,Hakkari,Hatay,Isparta,Mersin,İstanbul,İzmir,Kars,Kastamonu,Kayseri,Kırklareli,Kırşehir,Kocaeli,Konya,Kütahya,Malatya,Manisa,Kahramanmaraş,Mardin,Muğla,Muş,Nevşehir,Niğde,Ordu,Rize,Sakarya,Samsun,Siirt,Sinop,Sivas,Tekirdağ,Tokat,Trabzon,Tunceli,Şanlıurfa,Uşak,Van,Yozgat,Zonguldak,Aksaray,Bayburt,Karaman,Kırıkkale,Batman,Şırnak,Bartın,Ardahan,Iğdır,Yalova,Karabük,Kilis,Osmaniye,Düzce".split(",")


def _key(value: str) -> str:
    value = value.strip().casefold().replace("ı", "i")
    return "".join(character for character in unicodedata.normalize("NFKD", value) if not unicodedata.combining(character))


PROVINCE_LOOKUP = {_key(name): (str(index), name) for index, name in enumerate(PROVINCES, start=1)}
CACHE_TTL = timedelta(hours=6)
PARTIAL_CACHE_TTL = timedelta(minutes=15)


def resolve_province(value: str) -> tuple[str, str, list[str]]:
    lookup = PROVINCE_LOOKUP.get(_key(value))
    if lookup is None and value.isdigit() and 1 <= int(value) <= 81:
        lookup = (str(int(value)), PROVINCES[int(value) - 1])
    if lookup is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Unknown Türkiye province.")
    code, name = lookup
    return code, name, ["341", "342"] if code == "34" else [code]


def get_prices(db: Session, province: str, provider: EpdkFuelProvider | None = None) -> tuple[list[FuelPrice], bool]:
    code, name, service_codes = resolve_province(province)
    cached = list(db.scalars(select(FuelPrice).where(FuelPrice.province_code == code).order_by(FuelPrice.fuel_type)))
    now = datetime.now(timezone.utc)
    cache_ttl = CACHE_TTL if len(cached) == 3 else PARTIAL_CACHE_TTL
    if cached and all(now - _aware(item.fetched_at) < cache_ttl for item in cached):
        return cached, False

    provider = provider or EpdkFuelProvider()
    try:
        fresh = provider.fetch(service_codes)
        if not fresh:
            raise ValueError("EPDK returned no supported fuel prices.")
        by_type = {item.fuel_type: item for item in cached}
        for fuel_type, aggregate in fresh.items():
            item = by_type.get(fuel_type) or FuelPrice(province_code=code, province_name=name, fuel_type=fuel_type)
            item.minimum_price = aggregate.minimum_price
            item.average_price = aggregate.average_price
            item.maximum_price = aggregate.maximum_price
            item.sample_count = aggregate.sample_count
            item.observed_at = aggregate.observed_at
            item.fetched_at = now
            item.source = "EPDK"
            db.add(item)
        db.commit()
        refreshed = list(db.scalars(select(FuelPrice).where(FuelPrice.province_code == code).order_by(FuelPrice.fuel_type)))
        return refreshed, False
    except (httpx.HTTPError, ValueError):
        db.rollback()
        if cached:
            return cached, True
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="EPDK fuel price service is temporarily unavailable.")


def _aware(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
