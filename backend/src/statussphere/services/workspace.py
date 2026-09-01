from uuid import UUID

from statussphere.exceptions import WorkspaceNotFoundError
from statussphere.models.workspace import Workspace
from statussphere.repositories.workspace import WorkspaceRepository


class WorkspaceService:
    def __init__(
        self,
        repository: WorkspaceRepository,
    ) -> None:
        self.repository = repository

    async def create(self) -> Workspace:
        return await self.repository.create()

    async def get_by_id(
        self,
        workspace_id: UUID,
    ) -> Workspace:
        workspace = await self.repository.get_by_id(workspace_id)
        if workspace is None:
            raise WorkspaceNotFoundError(f"Workspace '{workspace_id}' not found.")
        return workspace
