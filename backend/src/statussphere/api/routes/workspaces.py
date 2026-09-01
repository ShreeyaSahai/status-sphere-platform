from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.db.session import get_db
from statussphere.exceptions import WorkspaceNotFoundError
from statussphere.repositories.workspace import WorkspaceRepository
from statussphere.schemas.workspace import WorkspaceResponse
from statussphere.services.workspace import WorkspaceService

router = APIRouter(
    prefix="/workspaces",
    tags=["Workspaces"],
)


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_workspace(
    db: AsyncSession = Depends(get_db),
):
    repository = WorkspaceRepository(db)
    service = WorkspaceService(repository)
    return await service.create()


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
)
async def get_workspace(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = WorkspaceRepository(db)
    service = WorkspaceService(repository)
    try:
        return await service.get_by_id(workspace_id)
    except WorkspaceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
