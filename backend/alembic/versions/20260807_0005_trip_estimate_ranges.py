"""add trip estimate ranges"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_0005"
down_revision: str | None = "20260806_0004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("min_fuel_required", sa.Numeric(9, 2), nullable=True))
    op.add_column("trips", sa.Column("max_fuel_required", sa.Numeric(9, 2), nullable=True))
    op.add_column("trips", sa.Column("min_total_cost", sa.Numeric(12, 2), nullable=True))
    op.add_column("trips", sa.Column("max_total_cost", sa.Numeric(12, 2), nullable=True))
    op.add_column("trips", sa.Column("min_fuel_stops", sa.Integer(), nullable=True))
    op.add_column("trips", sa.Column("max_fuel_stops", sa.Integer(), nullable=True))

    op.execute("UPDATE trips SET min_fuel_required = fuel_required, max_fuel_required = fuel_required, min_total_cost = total_cost, max_total_cost = total_cost, min_fuel_stops = 0, max_fuel_stops = 0")

    for column in ("min_fuel_required", "max_fuel_required", "min_total_cost", "max_total_cost", "min_fuel_stops", "max_fuel_stops"):
        op.alter_column("trips", column, nullable=False)


def downgrade() -> None:
    for column in ("max_fuel_stops", "min_fuel_stops", "max_total_cost", "min_total_cost", "max_fuel_required", "min_fuel_required"):
        op.drop_column("trips", column)
