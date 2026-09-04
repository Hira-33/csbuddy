import asyncio
import time
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException

from app.config import Settings, get_settings
from app.deps import get_classifier, get_match_engine, get_repository
from app.services.classifier import IntentClassifier
from app.services.matcher import MatchEngine
from app.services.repository import TermRepository

router = APIRouter(prefix="/admin", tags=["admin"])
_start_time = time.time()
_rebuild_lock = asyncio.Lock()


@router.get("/health")
def health(
    settings: Settings = Depends(get_settings),
    repo: TermRepository = Depends(get_repository),
    engine: MatchEngine = Depends(get_match_engine),
    classifier: IntentClassifier = Depends(get_classifier),
):
    return {
        "status": "ok",
        "version": settings.version,
        "terms": len(repo.all()),
        "embeddings": {
            "loaded": engine.is_ready,
            "model": engine.model_name,
            "dim": engine.dim,
            "stale": False,
        },
        "intent_model": {
            "loaded": classifier.is_ready,
            "classes": classifier.meta.get("intent_classes", []),
            "num_terms": classifier.meta.get("num_terms", 0),
        },
        "uptime_s": int(time.time() - _start_time),
    }


@router.post("/embeddings/rebuild")
async def rebuild_embeddings(
    x_admin_token: Annotated[str | None, Header()] = None,
    settings: Settings = Depends(get_settings),
    engine: MatchEngine = Depends(get_match_engine),
):
    if not settings.admin_token:
        raise HTTPException(status_code=404, detail="Admin token not configured")
    if x_admin_token != settings.admin_token:
        raise HTTPException(status_code=403, detail="Invalid admin token")

    async with _rebuild_lock:
        start = time.time()
        await asyncio.to_thread(engine.build)
        elapsed = int((time.time() - start) * 1000)

    return {"rebuilt": True, "terms": engine.dim, "elapsed_ms": elapsed}
