from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.deps import warm_models
from app.routers import admin, ask, graph, intent, terms


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    if not settings.debug:
        warm_models()
    yield


settings = get_settings()
app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/api")
app.include_router(terms.router, prefix="/api")
app.include_router(ask.router, prefix="/api")
app.include_router(graph.router, prefix="/api")
app.include_router(intent.router, prefix="/api")


@app.get("/")
def root():
    return {"message": "CSBuddy API", "docs": "/docs"}
