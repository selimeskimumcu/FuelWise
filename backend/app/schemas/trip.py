import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class TripCreate(BaseModel):
    vehicle_name: str | None = Field(default=None, max_length=100)
    origin: str | None = Field(default=None, max_length=240)
    destination: str | None = Field(default=None, max_length=240)
    trip_type: Literal["one-way", "round-trip"]
    traffic_condition: Literal["flowing", "normal", "heavy", "very-heavy"] = "normal"
    total_distance: float = Field(gt=0, le=100000)
    consumption: float = Field(gt=0, le=100)
    tank_capacity: float = Field(gt=0, le=1000)
    fuel_price: float = Field(gt=0, le=10000)
    fuel_required: float = Field(gt=0, le=100000)
    total_cost: float = Field(gt=0, le=100000000)


class TripResponse(TripCreate):
    id: uuid.UUID
    created_at: datetime
    min_fuel_required: float
    max_fuel_required: float
    min_total_cost: float
    max_total_cost: float
    min_fuel_stops: int
    max_fuel_stops: int

    model_config = ConfigDict(from_attributes=True)


class TripCalculationRequest(BaseModel):
    distance: float = Field(gt=0, le=100000)
    consumption: float = Field(gt=0, le=100)
    tank_capacity: float = Field(gt=0, le=1000)
    fuel_price: float = Field(gt=0, le=10000)
    minimum_fuel_price: float | None = Field(default=None, gt=0, le=10000)
    maximum_fuel_price: float | None = Field(default=None, gt=0, le=10000)
    trip_type: Literal["one-way", "round-trip"]
    traffic_condition: Literal["flowing", "normal", "heavy", "very-heavy"] = "normal"
    vehicle_name: str | None = Field(default=None, max_length=100)
    origin: str | None = Field(default=None, max_length=240)
    destination: str | None = Field(default=None, max_length=240)

    model_config = ConfigDict(extra="forbid")


class TripCalculationResponse(BaseModel):
    total_distance: float
    fuel_required: float
    total_cost: float
    estimated_range: float
    fuel_stops: int
    min_fuel_required: float
    max_fuel_required: float
    min_total_cost: float
    max_total_cost: float
    min_fuel_stops: int
    max_fuel_stops: int
    saved: bool
    trip_id: uuid.UUID | None = None
