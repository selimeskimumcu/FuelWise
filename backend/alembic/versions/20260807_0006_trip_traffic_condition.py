"""add trip traffic condition"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_0006"
down_revision: str | None = "20260807_0005"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("trips", sa.Column("traffic_condition", sa.String(20), nullable=False, server_default="normal"))
    op.alter_column("trips", "traffic_condition", server_default=None)


def downgrade() -> None:
    op.drop_column("trips", "traffic_condition")
