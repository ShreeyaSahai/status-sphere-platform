from uuid import UUID

from statussphere.models.incident import Incident
from statussphere.repositories.incident import IncidentRepository


class IncidentService:
    def __init__(
        self,
        repository: IncidentRepository,
    ) -> None:
        self.repository = repository

    async def list(
        self,
        application_id: UUID | None = None,
    ) -> list[Incident]:
        return await self.repository.list(application_id)