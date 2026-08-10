"""create trip history"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260806_0004"
down_revision: str | None = "20260806_0003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "trips",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("vehicle_name", sa.String(100), nullable=True),
        sa.Column("origin", sa.String(240), nullable=True),
        sa.Column("destination", sa.String(240), nullable=True),
        sa.Column("trip_type", sa.String(20), nullable=False),
        sa.Column("total_distance", sa.Numeric(9, 2), nullable=False),
        sa.Column("consumption", sa.Numeric(6, 2), nullable=False),
        sa.Column("tank_capacity", sa.Numeric(7, 2), nullable=False),
        sa.Column("fuel_price", sa.Numeric(8, 2), nullable=False),
        sa.Column("fuel_required", sa.Numeric(9, 2), nullable=False),
        sa.Column("total_cost", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_trips_user_id", "trips", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_trips_user_id", table_name="trips")
    op.drop_table("trips")
