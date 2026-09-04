from fastapi import APIRouter, Depends, Query

from app.deps import get_repository
from app.services.graph_service import GraphService
from app.services.repository import TermRepository

router = APIRouter(prefix="/graph", tags=["graph"])


@router.get("")
def get_graph(
    root_id: str | None = None,
    depth: int = Query(1, ge=1, le=3),
    repo: TermRepository = Depends(get_repository),
):
    service = GraphService(repo)
    return service.build(root_id=root_id, depth=depth)
