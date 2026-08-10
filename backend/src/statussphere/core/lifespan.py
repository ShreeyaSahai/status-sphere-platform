from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from statussphere.services.scheduler import MonitoringScheduler


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    monitoring_scheduler = MonitoringScheduler()

    monitoring_scheduler.start()

    app.state.monitoring_scheduler = monitoring_scheduler

    try:
        yield
    finally:
        await monitoring_scheduler.shutdown()