from pathlib import Path

import pytest

from app.config import Settings
from app.services.matcher import MatchEngine
from app.services.repository import JsonTermRepository


@pytest.fixture
def repo():
    return JsonTermRepository(Path(__file__).resolve().parent.parent / "data" / "terms.json")


@pytest.fixture
def settings():
    return Settings()


def test_match_finds_recursion(repo, settings):
    engine = MatchEngine(repo, settings)
    engine.build()
    results = engine.match("how does recursion work", top_k=3)
    assert results
    assert results[0]["term_id"] == "recursion"
    assert results[0]["score"] > 0.5


def test_match_finds_binary_search(repo, settings):
    engine = MatchEngine(repo, settings)
    engine.build()
    results = engine.match("search in sorted array", top_k=3)
    ids = [r["term_id"] for r in results]
    assert "binary-search" in ids
