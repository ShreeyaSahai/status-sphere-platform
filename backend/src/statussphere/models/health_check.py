from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from statussphere.db.base import Base
from statussphere.models.enums import HealthStatus
from statussphere.models.mixins import UUIDMixin

if TYPE_CHECKING:
    from statussphere.models.application import Application


class HealthCheck(Base, UUIDMixin):
    __tablename__ = "health_checks"

    application_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[HealthStatus] = mapped_column(
        Enum(
            HealthStatus,
            name="health_status",
        ),
        nullable=False,
        index=True,
    )

    status_code: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    response_time_ms: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
    )

    application: Mapped[Application] = relationship(
        back_populates="health_checks",
    )
