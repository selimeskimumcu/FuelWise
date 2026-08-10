from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict


FuelType = Literal["gasoline", "diesel", "lpg"]


class FuelPriceResponse(BaseModel):
    province_code: str
    province_name: str
    fuel_type: FuelType
    minimum_price: float
    average_price: float
    maximum_price: float
    sample_count: int
    observed_at: date
    fetched_at: datetime
    source: str
    stale: bool = False

    model_config = ConfigDict(from_attributes=True)


class FuelPriceListResponse(BaseModel):
    prices: list[FuelPriceResponse]
    source_url: str
    cache_hours: int
