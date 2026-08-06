from fastapi import FastAPI

from statussphere.api.routes.health import router as health_router
from statussphere.core.config import settings
from statussphere.core.lifespan import lifespan
from statussphere.core.logging import configure_logging

configure_logging()

app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(
    health_router,
    prefix="/api/v1",
)