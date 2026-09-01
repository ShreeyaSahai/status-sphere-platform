from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.db.session import get_db
from statussphere.exceptions import (
    ApplicationNotFoundError,
    DuplicateApplicationError,
    EnvironmentNotFoundError,
    WorkspaceNotFoundError,
)
from statussphere.repositories.application import ApplicationRepository
from statussphere.repositories.health_check import HealthCheckRepository
from statussphere.repositories.workspace import WorkspaceRepository
from statussphere.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from statussphere.schemas.health_check import HealthCheckResponse
from statussphere.services.application import ApplicationService

router = APIRouter(
    prefix="/workspaces/{workspace_id}/applications",
    tags=["Applications"],
)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application(
    workspace_id: UUID,
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    repository = ApplicationRepository(db)
    service = ApplicationService(repository, workspace_repo)

    try:
        application = await service.create(workspace_id, payload)
        return application

    except WorkspaceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except EnvironmentNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc

    except DuplicateApplicationError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.get(
    "",
    response_model=list[ApplicationResponse],
)
async def list_applications(
    workspace_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    repository = ApplicationRepository(db)
    service = ApplicationService(repository, workspace_repo)

    try:
        return await service.list_by_workspace(workspace_id)
    except WorkspaceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.get(
    "/{application_id}",
    response_model=ApplicationResponse,
)
async def get_application(
    workspace_id: UUID,
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    repository = ApplicationRepository(db)
    service = ApplicationService(repository, workspace_repo)

    try:
        return await service.get_by_id_in_workspace(workspace_id, application_id)
    except WorkspaceNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except ApplicationNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found.",
        ) from exc


@router.patch(
    "/{application_id}",
    response_model=ApplicationResponse,
)
async def update_application(
    workspace_id: UUID,
    application_id: UUID,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    repository = ApplicationRepository(db)
    service = ApplicationService(repository, workspace_repo)

    try:
        return await service.update(
            workspace_id,
            application_id,
            payload,
        )
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


@router.delete(
    "/{application_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_application(
    workspace_id: UUID,
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    workspace_repo = WorkspaceRepository(db)
    repository = ApplicationRepository(db)
    service = ApplicationService(repository, workspace_repo)

    try:
        await service.deactivate(workspace_id, application_id)
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


@router.get(
    "/{application_id}/health-checks",
    response_model=list[HealthCheckResponse],
)
async def list_health_checks(
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

    health_check_repo = HealthCheckRepository(db)
    return await health_check_repo.list_by_application(application_id)