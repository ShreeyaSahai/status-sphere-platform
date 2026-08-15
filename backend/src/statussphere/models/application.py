from __future__ import annotations

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    ARRAY,
    Boolean,
    Enum,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from statussphere.db.base import Base
from statussphere.models.enums import HttpMethod
from statussphere.models.mixins import TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from statussphere.models.environment import Environment
    from statussphere.models.health_check import HealthCheck
    from statussphere.models.incident import Incident


class Application(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "applications"

    __table_args__ = (
        UniqueConstraint(
            "environment_id",
            "slug",
            name="uq_environment_application_slug",
        ),
    )

    environment_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "environments.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    url: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    method: Mapped[HttpMethod] = mapped_column(
        Enum(HttpMethod, name="http_method"),
        default=HttpMethod.GET,
        nullable=False,
    )

    expected_status_code: Mapped[int] = mapped_column(
        Integer,
        default=200,
        nullable=False,
    )

    timeout_seconds: Mapped[int] = mapped_column(
        Integer,
        default=10,
        nullable=False,
    )

    check_interval_seconds: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
    )

    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=list,
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        index=True,
    )

    environment: Mapped[Environment] = relationship(
        back_populates="applications",
    )

    health_checks: Mapped[list[HealthCheck]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    incidents: Mapped[list[Incident]] = relationship(
        back_populates="application",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
