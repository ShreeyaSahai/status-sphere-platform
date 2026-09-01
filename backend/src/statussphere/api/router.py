from fastapi import APIRouter

from statussphere.api.routes.applications import (
    router as application_router,
)
from statussphere.api.routes.incidents import (
    router as incident_router,
)
from statussphere.api.routes.workspaces import (
    router as workspace_router,
)

api_router = APIRouter(
    prefix="/api/v1",
)

api_router.include_router(workspace_router)
api_router.include_router(application_router)
api_router.include_router(incident_router)