"""create workspaces table and add workspace_id to applications

Revision ID: b8f9e0a1c2d3
Revises: 297a889455af
Create Date: 2026-09-01 12:00:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "b8f9e0a1c2d3"
down_revision: str | Sequence[str] | None = "297a889455af"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Create workspaces table
    op.create_table(
        "workspaces",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_workspaces")),
    )

    # 2. Clean up any existing throwaway test application data before adding NOT NULL workspace_id
    op.execute("DELETE FROM health_checks")
    op.execute("DELETE FROM incidents")
    op.execute("DELETE FROM applications")

    # 3. Add workspace_id column to applications
    op.add_column(
        "applications",
        sa.Column("workspace_id", sa.UUID(), nullable=False),
    )
    op.create_index(
        op.f("ix_applications_workspace_id"),
        "applications",
        ["workspace_id"],
        unique=False,
    )
    op.create_foreign_key(
        op.f("fk_applications_workspace_id_workspaces"),
        "applications",
        "workspaces",
        ["workspace_id"],
        ["id"],
        ondelete="CASCADE",
    )

    # 4. Update unique constraint to be workspace-scoped
    op.drop_constraint("uq_environment_application_slug", "applications", type_="unique")
    op.create_unique_constraint(
        "uq_workspace_environment_application_slug",
        "applications",
        ["workspace_id", "environment_id", "slug"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_workspace_environment_application_slug",
        "applications",
        type_="unique",
    )
    op.create_unique_constraint(
        "uq_environment_application_slug",
        "applications",
        ["environment_id", "slug"],
    )
    op.drop_constraint(
        op.f("fk_applications_workspace_id_workspaces"),
        "applications",
        type_="foreignkey",
    )
    op.drop_index(op.f("ix_applications_workspace_id"), table_name="applications")
    op.drop_column("applications", "workspace_id")
    op.drop_table("workspaces")
