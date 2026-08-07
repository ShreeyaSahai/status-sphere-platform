from statussphere.exceptions import (
    DuplicateApplicationError,
    EnvironmentNotFoundError,
    ApplicationNotFoundError,
)
from statussphere.models.application import Application
from statussphere.repositories.application import (
    ApplicationRepository,
)
from statussphere.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
)
from statussphere.utils.slug import slugify

from uuid import UUID

class ApplicationService:
    def __init__(
        self,
        repository: ApplicationRepository,
    ) -> None:
        self.repository = repository

    async def create(
        self,
        payload: ApplicationCreate,
    ) -> Application:
        environment = await self.repository.get_environment_by_slug(
            payload.environment_slug
        )

        if environment is None:
            raise EnvironmentNotFoundError(
                f"Environment '{payload.environment_slug}' does not exist."
            )

        slug = slugify(payload.name)

        existing = await self.repository.get_by_slug(
            environment.id,
            slug,
        )

        if existing is not None:
            raise DuplicateApplicationError(
                f"Application '{payload.name}' already exists."
            )

        application = Application(
            environment_id=environment.id,
            name=payload.name,
            slug=slug,
            url=str(payload.url),
            method=payload.method,
            expected_status_code=payload.expected_status_code,
            timeout_seconds=payload.timeout_seconds,
            check_interval_seconds=payload.check_interval_seconds,
            tags=payload.tags,
        )

        return await self.repository.create(application)

    async def list(self):
        return await self.repository.list()


    async def update(
        self,
        application_id: UUID,
        payload: ApplicationUpdate,
    ):
        application = await self.repository.get_by_id(
            application_id
        )

        if application is None:
            raise ApplicationNotFoundError()

        update_data = payload.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(application, field, value)

        return await self.repository.save(application)
    

    async def deactivate(
        self,
        application_id: UUID,
    ):
        application = await self.repository.get_by_id(
            application_id
        )

        if application is None:
            raise ApplicationNotFoundError()

        application.is_active = False

        return await self.repository.save(application)