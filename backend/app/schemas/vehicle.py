import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


VehicleType = Literal["car", "motorcycle", "truck", "bus", "semi_truck"]
FuelType = Literal["gasoline", "diesel", "lpg"]


class VehicleBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    make: str | None = Field(default=None, max_length=60)
    model: str | None = Field(default=None, max_length=80)
    year: int | None = Field(default=None, ge=1950, le=2100)
    vehicle_type: VehicleType = "car"
    fuel_type: FuelType = "gasoline"
    consumption: float = Field(gt=0, le=100)
    tank_capacity: float = Field(gt=0, le=1000)
    is_default: bool = False

    @field_validator("name", "make", "model")
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    make: str | None = Field(default=None, max_length=60)
    model: str | None = Field(default=None, max_length=80)
    year: int | None = Field(default=None, ge=1950, le=2100)
    vehicle_type: VehicleType | None = None
    fuel_type: FuelType | None = None
    consumption: float | None = Field(default=None, gt=0, le=100)
    tank_capacity: float | None = Field(default=None, gt=0, le=1000)
    is_default: bool | None = None

    @field_validator("name", "make", "model")
    @classmethod
    def clean_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class VehicleResponse(VehicleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
