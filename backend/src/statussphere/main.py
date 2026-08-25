from fastapi import FastAPI
from prometheus_client import make_asgi_app
from statussphere.api.router import api_router
from statussphere.core.lifespan import lifespan

app = FastAPI(
    title="StatusSphere API",
    lifespan=lifespan,
)
app.include_router(api_router)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }