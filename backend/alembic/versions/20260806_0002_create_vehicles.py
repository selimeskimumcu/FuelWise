"""create vehicles table"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa


revision: str = "20260806_0002"
down_revision: str | None = "20260804_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "vehicles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("make", sa.String(length=60), nullable=True),
        sa.Column("model", sa.String(length=80), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("vehicle_type", sa.String(length=20), nullable=False),
        sa.Column("fuel_type", sa.String(length=20), nullable=False),
        sa.Column("consumption", sa.Numeric(precision=6, scale=2), nullable=False),
        sa.Column("tank_capacity", sa.Numeric(precision=7, scale=2), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_vehicles_user_id"), "vehicles", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_vehicles_user_id"), table_name="vehicles")
    op.drop_table("vehicles")
