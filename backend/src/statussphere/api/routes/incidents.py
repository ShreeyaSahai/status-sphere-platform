from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.db.session import get_db
from statussphere.repositories.incident import IncidentRepository
from statussphere.schemas.incident import IncidentResponse

router = APIRouter(
    prefix="/applications/{application_id}/incidents",
    tags=["Incidents"],
)


@router.get(
    "",
    response_model=list[IncidentResponse],
)
async def list_incidents(
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = IncidentRepository(db)

    return await repository.list_by_application(application_id)