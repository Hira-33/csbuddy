from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from app.config import Settings, get_settings
from app.deps import get_match_engine, get_repository
from app.models import AskRequest
from app.services.explainer import Explainer
from app.services.matcher import MatchEngine
from app.services.repository import TermRepository

router = APIRouter(prefix="/ask", tags=["ask"])


@router.post("")
async def ask(
    request: AskRequest,
    repo: TermRepository = Depends(get_repository),
    engine: MatchEngine = Depends(get_match_engine),
    settings: Settings = Depends(get_settings),
):
    explainer = Explainer(repo, engine, settings)
    return StreamingResponse(
        explainer.stream(request),
        media_type="text/event-stream",
        headers={"X-Accel-Buffering": "no"},
    )
