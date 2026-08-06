from contextlib import asynccontextmanager

from fastapi import FastAPI
import structlog

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting StatusSphere")

    yield

    logger.info("Stopping StatusSphere")