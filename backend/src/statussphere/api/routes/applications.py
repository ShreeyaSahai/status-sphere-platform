from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from statussphere.db.session import get_db
from statussphere.exceptions import (
    ApplicationNotFoundError,
    DuplicateApplicationError,
    EnvironmentNotFoundError,
)
from statussphere.repositories.application import ApplicationRepository
from statussphere.repositories.health_check import HealthCheckRepository
from statussphere.schemas.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationUpdate,
)
from statussphere.schemas.health_check import HealthCheckResponse
from statussphere.services.application import ApplicationService

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)


@router.post(
    "",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_application(
    payload: ApplicationCreate,
    db: AsyncSession = Depends(get_db),
):
    repository = ApplicationRepository(db)
    service = ApplicationService(repository)

    try:
        application = await service.create(payload)
        return application

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
    db: AsyncSession = Depends(get_db),
):
    repository = ApplicationRepository(db)
    service = ApplicationService(repository)

    return await service.list()


@router.patch(
    "/{application_id}",
    response_model=ApplicationResponse,
)
async def update_application(
    application_id: UUID,
    payload: ApplicationUpdate,
    db: AsyncSession = Depends(get_db),
):
    repository = ApplicationRepository(db)
    service = ApplicationService(repository)

    try:
        return await service.update(
            application_id,
            payload,
        )

    except ApplicationNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        ) from None


@router.delete(
    "/{application_id}",
    status_code=204,
)
async def delete_application(
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = ApplicationRepository(db)
    service = ApplicationService(repository)

    try:
        await service.deactivate(application_id)

    except ApplicationNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Application not found.",
        ) from None

@router.get(
    "/{application_id}/health-checks",
    response_model=list[HealthCheckResponse],
)
async def list_health_checks(
    application_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    repository = HealthCheckRepository(db)

    return await repository.list_by_application(application_id)