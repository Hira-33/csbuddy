from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import Settings
from app.deps import get_match_engine, get_repository, get_settings
from app.models import MatchedTerm, Term, TermSummary
from app.services.matcher import MatchEngine
from app.services.repository import TermRepository

router = APIRouter(prefix="/terms", tags=["terms"])


@router.get("", response_model=dict)
def list_terms(
    q: str | None = None,
    tag: str | None = None,
    difficulty: str | None = None,
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    repo: TermRepository = Depends(get_repository),
):
    items, total = repo.search(query=q, tag=tag, difficulty=difficulty, limit=limit, offset=offset)
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "items": [TermSummary.from_term(t) for t in items],
    }


@router.get("/{term_id}", response_model=Term)
def get_term(term_id: str, repo: TermRepository = Depends(get_repository)):
    term = repo.get(term_id)
    if term is None:
        raise HTTPException(status_code=404, detail=f"Term '{term_id}' not found")
    return term


@router.get("/related/{term_id}", response_model=dict)
def related_terms(
    term_id: str,
    depth: int = Query(1, ge=1, le=2),
    repo: TermRepository = Depends(get_repository),
):
    term = repo.get(term_id)
    if term is None:
        raise HTTPException(status_code=404, detail=f"Term '{term_id}' not found")

    all_terms = repo.all()
    by_id = {t.id: t for t in all_terms}

    related_ids = set(term.related_terms)
    if depth >= 2:
        for rid in list(related_ids):
            rterm = by_id.get(rid)
            if rterm:
                related_ids.update(rterm.related_terms)
        related_ids.discard(term_id)

    related = [by_id[rid] for rid in related_ids if rid in by_id]
    return {
        "term_id": term_id,
        "depth": depth,
        "related": [TermSummary.from_term(t) for t in related],
    }


@router.get("/match/{query}", response_model=list[MatchedTerm])
def match_query(
    query: str,
    top_k: int = Query(5, ge=1, le=20),
    engine: MatchEngine = Depends(get_match_engine),
):
    return engine.match(query, top_k=top_k)
