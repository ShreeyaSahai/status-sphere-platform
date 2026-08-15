"""
Import all SQLAlchemy models so that they are registered with Base.metadata.

This module should only be imported during application startup or by Alembic.
"""

from statussphere.models.application import Application
from statussphere.models.environment import Environment
from statussphere.models.health_check import HealthCheck
from statussphere.models.incident import Incident

__all__ = [
    "Application",
    "Environment",
    "HealthCheck",
    "Incident",
]
