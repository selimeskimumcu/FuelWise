import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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

    # Columns that are NOT NULL in the database: an explicit null would blow up
    # on commit with an IntegrityError (HTTP 500). Reject it as a clean 422.
    # Omitted fields still mean "leave unchanged"; null is only legal for the
    # nullable columns (make, model, year), where it clears the value.
    _required_fields = ("name", "vehicle_type", "fuel_type", "consumption", "tank_capacity")

    @model_validator(mode="after")
    def reject_null_for_required_fields(self) -> "VehicleUpdate":
        for field_name in self._required_fields:
            if field_name in self.model_fields_set and getattr(self, field_name) is None:
                raise ValueError(f"'{field_name}' cannot be null")
        return self


class VehicleResponse(VehicleBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
