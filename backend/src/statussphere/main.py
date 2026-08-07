from fastapi import FastAPI

from statussphere.api.router import api_router

app = FastAPI(
    title="StatusSphere API",
)

app.include_router(api_router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
    }