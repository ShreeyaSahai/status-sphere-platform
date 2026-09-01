from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.db.session import get_db
from statussphere.exceptions import (
    ApplicationNotFoundError,
    WorkspaceNotFoundError,
)
from statussphere.repositories.application import ApplicationRepository
from statussphere.repositories.incident import IncidentRepository
from statussphere.repositories.workspace import WorkspaceRepository
from statussphere.schemas.incident import IncidentResponse
from statussphere.services.application import ApplicationService

router = APIRouter(
    prefix="/workspaces/{workspace_id}/applications/{application_id}/incidents",
    tags=["Incidents"],
)


@router.get(
    "",
    response_model=list[IncidentResponse],
)
async def list_incidents(
    workspace_id: UUID,
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    app_repo = ApplicationRepository(db)
    service = ApplicationService(app_repo, workspace_repo)

    try:
        await service.get_by_id_in_workspace(workspace_id, application_id)
    except WorkspaceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except ApplicationNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        ) from None

    repository = IncidentRepository(db)
    return await repository.list_by_application(application_id)