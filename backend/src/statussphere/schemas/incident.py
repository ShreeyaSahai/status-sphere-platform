from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from statussphere.models.enums import IncidentStatus


class IncidentResponse(BaseModel):
    id: UUID
    application_id: UUID
    status: IncidentStatus
    reason: str | None
    started_at: datetime
    resolved_at: datetime | None

    model_config = {
        "from_attributes": True,
    }