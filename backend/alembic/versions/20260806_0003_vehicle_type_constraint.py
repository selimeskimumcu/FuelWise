"""restrict supported vehicle types"""

from collections.abc import Sequence

from alembic import op


revision: str = "20260806_0003"
down_revision: str | None = "20260806_0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_check_constraint(
        "ck_vehicles_vehicle_type",
        "vehicles",
        "vehicle_type IN ('car', 'motorcycle', 'truck', 'bus', 'semi_truck')",
    )


def downgrade() -> None:
    op.drop_constraint("ck_vehicles_vehicle_type", "vehicles", type_="check")
