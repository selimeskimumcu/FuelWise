import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Integer, Numeric, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.models.user import utc_now


class FuelPrice(Base):
    __tablename__ = "fuel_prices"
    __table_args__ = (UniqueConstraint("province_code", "fuel_type", name="uq_fuel_prices_province_fuel"),)

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    province_code: Mapped[str] = mapped_column(String(3), index=True)
    province_name: Mapped[str] = mapped_column(String(40))
    fuel_type: Mapped[str] = mapped_column(String(20), index=True)
    minimum_price: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    average_price: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    maximum_price: Mapped[Decimal] = mapped_column(Numeric(8, 3))
    sample_count: Mapped[int] = mapped_column(Integer)
    observed_at: Mapped[date] = mapped_column(Date)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, nullable=False)
    source: Mapped[str] = mapped_column(String(80), default="EPDK", nullable=False)
