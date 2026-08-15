from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from statussphere.db.base import Base
from statussphere.models.enums import IncidentStatus
from statussphere.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from statussphere.models.application import Application


class Incident(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "incidents"

    application_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "applications.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[IncidentStatus] = mapped_column(
        Enum(
            IncidentStatus,
            name="incident_status",
        ),
        default=IncidentStatus.OPEN,
        nullable=False,
        index=True,
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    application: Mapped[Application] = relationship(
        back_populates="incidents",
    )
