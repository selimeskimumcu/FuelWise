from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.fuel_price import FuelPriceListResponse, FuelPriceResponse, FuelType
from app.services.epdk_fuel import SOURCE_URL
from app.services.fuel_prices import CACHE_TTL, get_prices


router = APIRouter(prefix="/fuel-prices", tags=["Fuel Prices"])


@router.get("", response_model=FuelPriceListResponse)
def list_fuel_prices(
    province: str = Query(default="İstanbul", min_length=1, max_length=40),
    fuel_type: FuelType | None = Query(default=None),
    db: Session = Depends(get_db),
) -> FuelPriceListResponse:
    prices, stale = get_prices(db, province)
    if fuel_type:
        prices = [price for price in prices if price.fuel_type == fuel_type]
    return FuelPriceListResponse(
        prices=[FuelPriceResponse.model_validate(price).model_copy(update={"stale": stale}) for price in prices],
        source_url=SOURCE_URL,
        cache_hours=int(CACHE_TTL.total_seconds() // 3600),
    )
