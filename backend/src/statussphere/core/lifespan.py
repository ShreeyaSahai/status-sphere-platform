from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

import structlog
from fastapi import FastAPI

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    logger.info("Starting StatusSphere")

    yield

    logger.info("Stopping StatusSphere")