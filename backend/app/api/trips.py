from decimal import Decimal, ROUND_CEILING, ROUND_HALF_UP

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, get_optional_current_user
from app.models import Trip, User
from app.schemas.trip import TripCalculationRequest, TripCalculationResponse, TripResponse


router = APIRouter(prefix="/trips", tags=["Trips"])


@router.get("", response_model=list[TripResponse])
def list_trips(
    limit: int = Query(default=3, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[Trip]:
    return list(db.scalars(select(Trip).where(Trip.user_id == current_user.id).order_by(Trip.created_at.desc()).limit(limit)))


def money(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def required_stops(fuel: Decimal, tank_capacity: Decimal) -> int:
    full_tanks = int((fuel / tank_capacity).to_integral_value(rounding=ROUND_CEILING))
    return max(full_tanks - 1, 0)


@router.post("/calculate", response_model=TripCalculationResponse)
def calculate_trip(
    payload: TripCalculationRequest,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
) -> TripCalculationResponse:
    distance = Decimal(str(payload.distance))
    consumption = Decimal(str(payload.consumption))
    tank_capacity = Decimal(str(payload.tank_capacity))
    fuel_price = Decimal(str(payload.fuel_price))
    minimum_fuel_price = Decimal(str(payload.minimum_fuel_price or payload.fuel_price))
    maximum_fuel_price = Decimal(str(payload.maximum_fuel_price or payload.fuel_price))
    multiplier = Decimal("2") if payload.trip_type == "round-trip" else Decimal("1")

    total_distance = money(distance * multiplier)
    raw_fuel_required = total_distance * consumption / Decimal("100")
    legs = Decimal("2") if payload.trip_type == "round-trip" else Decimal("1")
    estimated_urban_distance = min(total_distance, Decimal("40") * legs)
    estimated_urban_fuel = raw_fuel_required * estimated_urban_distance / total_distance
    traffic_profiles = {
        "flowing": (Decimal("0.00"), Decimal("0.08")),
        "normal": (Decimal("0.08"), Decimal("0.25")),
        "heavy": (Decimal("0.20"), Decimal("0.40")),
        "very-heavy": (Decimal("0.35"), Decimal("0.60")),
    }
    min_traffic_rate, max_traffic_rate = traffic_profiles[payload.traffic_condition]
    min_raw_fuel = raw_fuel_required + estimated_urban_fuel * min_traffic_rate
    min_fuel_required = money(min_raw_fuel)
    traffic_buffer = estimated_urban_fuel * max_traffic_rate
    real_world_buffer = raw_fuel_required * Decimal("0.08")
    climate_and_load_buffer = raw_fuel_required * Decimal("0.03")
    max_raw_fuel = raw_fuel_required + traffic_buffer + real_world_buffer + climate_and_load_buffer
    max_fuel_required = money(max_raw_fuel)

    fuel_required = money((min_raw_fuel + max_raw_fuel) / Decimal("2"))
    min_total_cost = money(min_raw_fuel * minimum_fuel_price)
    max_total_cost = money(max_raw_fuel * maximum_fuel_price)
    total_cost = money((min_total_cost + max_total_cost) / Decimal("2"))
    estimated_range = money(tank_capacity / consumption * Decimal("100"))
    min_fuel_stops = required_stops(min_raw_fuel, tank_capacity)
    max_fuel_stops = required_stops(max_raw_fuel, tank_capacity)
    fuel_stops = required_stops((min_raw_fuel + max_raw_fuel) / Decimal("2"), tank_capacity)
    trip_id = None

    if current_user:
        trip = Trip(
            user_id=current_user.id,
            vehicle_name=payload.vehicle_name,
            origin=payload.origin,
            destination=payload.destination,
            trip_type=payload.trip_type,
            traffic_condition=payload.traffic_condition,
            total_distance=total_distance,
            consumption=consumption,
            tank_capacity=tank_capacity,
            fuel_price=fuel_price,
            fuel_required=fuel_required,
            total_cost=total_cost,
            min_fuel_required=min_fuel_required,
            max_fuel_required=max_fuel_required,
            min_total_cost=min_total_cost,
            max_total_cost=max_total_cost,
            min_fuel_stops=min_fuel_stops,
            max_fuel_stops=max_fuel_stops,
        )
        db.add(trip)
        db.commit()
        db.refresh(trip)
        trip_id = trip.id

    return TripCalculationResponse(
        total_distance=float(total_distance),
        fuel_required=float(fuel_required),
        total_cost=float(total_cost),
        estimated_range=float(estimated_range),
        fuel_stops=fuel_stops,
        min_fuel_required=float(min_fuel_required),
        max_fuel_required=float(max_fuel_required),
        min_total_cost=float(min_total_cost),
        max_total_cost=float(max_total_cost),
        min_fuel_stops=min_fuel_stops,
        max_fuel_stops=max_fuel_stops,
        saved=current_user is not None,
        trip_id=trip_id,
    )
