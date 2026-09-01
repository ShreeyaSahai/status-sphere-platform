from uuid import UUID

from statussphere.exceptions import (
    ApplicationNotFoundError,
    DuplicateApplicationError,
    EnvironmentNotFoundError,
    WorkspaceNotFoundError,
)
from statussphere.models.application import Application
from statussphere.repositories.application import ApplicationRepository
from statussphere.repositories.workspace import WorkspaceRepository
from statussphere.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
)
from statussphere.utils.slug import slugify


class ApplicationService:
    def __init__(
        self,
        repository: ApplicationRepository,
        workspace_repository: WorkspaceRepository | None = None,
    ) -> None:
        self.repository = repository
        self.workspace_repository = workspace_repository

    async def _ensure_workspace_exists(self, workspace_id: UUID) -> None:
        if self.workspace_repository is not None:
            workspace = await self.workspace_repository.get_by_id(workspace_id)
            if workspace is None:
                raise WorkspaceNotFoundError(f"Workspace '{workspace_id}' not found.")

    async def create(
        self,
        workspace_id: UUID,
        payload: ApplicationCreate,
    ) -> Application:
        await self._ensure_workspace_exists(workspace_id)

        environment = await self.repository.get_environment_by_slug(payload.environment_slug)

        if environment is None:
            raise EnvironmentNotFoundError(
                f"Environment '{payload.environment_slug}' does not exist."
            )

        slug = slugify(payload.name)

        existing = await self.repository.get_by_slug(
            workspace_id=workspace_id,
            environment_id=environment.id,
            slug=slug,
        )

        if existing is not None:
            raise DuplicateApplicationError(f"Application '{payload.name}' already exists.")

        application = Application(
            workspace_id=workspace_id,
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

    async def list_by_workspace(
        self,
        workspace_id: UUID,
    ) -> list[Application]:
        await self._ensure_workspace_exists(workspace_id)
        return await self.repository.list_by_workspace(workspace_id)

    async def list(self) -> list[Application]:
        return await self.repository.list()

    async def get_by_id_in_workspace(
        self,
        workspace_id: UUID,
        application_id: UUID,
    ) -> Application:
        await self._ensure_workspace_exists(workspace_id)

        application = await self.repository.get_by_id_in_workspace(
            workspace_id=workspace_id,
            application_id=application_id,
        )

        if application is None:
            raise ApplicationNotFoundError(
                f"Application '{application_id}' not found in workspace."
            )

        return application

    async def update(
        self,
        workspace_id: UUID,
        application_id: UUID,
        payload: ApplicationUpdate,
    ) -> Application:
        application = await self.get_by_id_in_workspace(workspace_id, application_id)

        update_data = payload.model_dump(exclude_unset=True)

        if "url" in update_data:
            update_data["url"] = str(update_data["url"])

        for field, value in update_data.items():
            setattr(application, field, value)

        return await self.repository.save(application)

    async def deactivate(
        self,
        workspace_id: UUID,
        application_id: UUID,
    ) -> Application:
        application = await self.get_by_id_in_workspace(workspace_id, application_id)
        application.is_active = False
        return await self.repository.save(application)
