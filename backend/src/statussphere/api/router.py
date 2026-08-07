from fastapi import APIRouter

from statussphere.api.routes.applications import (
    router as application_router,
)

api_router = APIRouter(
    prefix="/api/v1",
)

api_router.include_router(application_router)