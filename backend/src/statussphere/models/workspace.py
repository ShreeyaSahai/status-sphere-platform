from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, relationship

from statussphere.db.base import Base
from statussphere.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from statussphere.models.application import Application


class Workspace(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "workspaces"

    applications: Mapped[list[Application]] = relationship(
        back_populates="workspace",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
