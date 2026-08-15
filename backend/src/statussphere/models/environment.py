from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from statussphere.db.base import Base
from statussphere.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from statussphere.models.application import Application


class Environment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "environments"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    applications: Mapped[list[Application]] = relationship(
        back_populates="environment",
    )
