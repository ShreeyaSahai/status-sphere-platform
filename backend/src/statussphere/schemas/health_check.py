from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from statussphere.models.enums import HealthStatus


class HealthCheckResponse(BaseModel):
    id: UUID
    application_id: UUID
    status: HealthStatus
    status_code: int | None
    response_time_ms: int | None
    error_message: str | None
    checked_at: datetime

    model_config = {
        "from_attributes": True,
    }