"""create fuel price cache"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_0007"
down_revision: str | None = "20260807_0006"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "fuel_prices",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("province_code", sa.String(3), nullable=False),
        sa.Column("province_name", sa.String(40), nullable=False),
        sa.Column("fuel_type", sa.String(20), nullable=False),
        sa.Column("minimum_price", sa.Numeric(8, 3), nullable=False),
        sa.Column("average_price", sa.Numeric(8, 3), nullable=False),
        sa.Column("maximum_price", sa.Numeric(8, 3), nullable=False),
        sa.Column("sample_count", sa.Integer(), nullable=False),
        sa.Column("observed_at", sa.Date(), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("source", sa.String(80), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("province_code", "fuel_type", name="uq_fuel_prices_province_fuel"),
    )
    op.create_index("ix_fuel_prices_province_code", "fuel_prices", ["province_code"])
    op.create_index("ix_fuel_prices_fuel_type", "fuel_prices", ["fuel_type"])


def downgrade() -> None:
    op.drop_index("ix_fuel_prices_fuel_type", table_name="fuel_prices")
    op.drop_index("ix_fuel_prices_province_code", table_name="fuel_prices")
    op.drop_table("fuel_prices")
