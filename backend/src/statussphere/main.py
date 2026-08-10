from fastapi import FastAPI

from statussphere.api.router import api_router
from statussphere.core.lifespan import lifespan

app = FastAPI(
    title="StatusSphere API",
    lifespan=lifespan,
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }