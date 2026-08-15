from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.models.enums import IncidentStatus
from statussphere.models.incident import Incident


class IncidentRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_open_by_application(
        self,
        application_id: UUID,
    ) -> Incident | None:
        result = await self.session.execute(
            select(Incident)
            .where(
                Incident.application_id == application_id,
                Incident.status == IncidentStatus.OPEN,
            )
            .order_by(Incident.started_at.desc())
        )

        return result.scalars().first()

    async def list_by_application(
            self,
            application_id: UUID,
    ) -> list[Incident]:
        result = await self.session.execute(
            select(Incident)
            .where(Incident.application_id == application_id)
            .order_by(Incident.started_at.desc())
        )

        return list(result.scalars().all())

    async def list(
            self,
            application_id: UUID | None = None,
    ) -> list[Incident]:

        query = select(Incident).order_by(Incident.started_at.desc())

        if application_id is not None:
            query = query.where(
                Incident.application_id == application_id,
            )

        result = await self.session.execute(query)

        return list(result.scalars().all())

    async def create(
        self,
        incident: Incident,
    ) -> Incident:
        self.session.add(incident)

        await self.session.commit()
        await self.session.refresh(incident)

        return incident

    async def resolve(
        self,
        incident: Incident,
    ) -> Incident:

        incident.status = IncidentStatus.RESOLVED
        incident.resolved_at = datetime.now(UTC)

        await self.session.commit()
        await self.session.refresh(incident)

        return incident
