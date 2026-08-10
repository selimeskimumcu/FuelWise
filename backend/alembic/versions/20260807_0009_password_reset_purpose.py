"""add password reset purpose"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "20260807_0009"
down_revision: str | None = "20260807_0008"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("password_resets", sa.Column("purpose", sa.String(30), nullable=False, server_default="password_reset"))
    op.alter_column("password_resets", "purpose", server_default=None)
    op.create_index("ix_password_resets_purpose", "password_resets", ["purpose"])


def downgrade() -> None:
    op.drop_index("ix_password_resets_purpose", table_name="password_resets")
    op.drop_column("password_resets", "purpose")
