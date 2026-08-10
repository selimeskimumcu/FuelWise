import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.models.user import utc_now


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    vehicle_name: Mapped[str | None] = mapped_column(String(100))
    origin: Mapped[str | None] = mapped_column(String(240))
    destination: Mapped[str | None] = mapped_column(String(240))
    trip_type: Mapped[str] = mapped_column(String(20))
    traffic_condition: Mapped[str] = mapped_column(String(20), default="normal")
    total_distance: Mapped[Decimal] = mapped_column(Numeric(9, 2))
    consumption: Mapped[Decimal] = mapped_column(Numeric(6, 2))
    tank_capacity: Mapped[Decimal] = mapped_column(Numeric(7, 2))
    fuel_price: Mapped[Decimal] = mapped_column(Numeric(8, 2))
    fuel_required: Mapped[Decimal] = mapped_column(Numeric(9, 2))
    total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    min_fuel_required: Mapped[Decimal] = mapped_column(Numeric(9, 2))
    max_fuel_required: Mapped[Decimal] = mapped_column(Numeric(9, 2))
    min_total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    max_total_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    min_fuel_stops: Mapped[int] = mapped_column(Integer, default=0)
    max_fuel_stops: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)

    user = relationship("User", back_populates="trips")
