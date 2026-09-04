from __future__ import annotations

import hashlib
import json
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Iterable

from app.models import Term


class TermRepository(ABC):
    @abstractmethod
    def all(self) -> list[Term]:
        """Return every term in the repository."""

    @abstractmethod
    def get(self, term_id: str) -> Term | None:
        """Return a single term by id, or None if not found."""

    @abstractmethod
    def content_hash(self) -> str:
        """Return a hash representing the current content. Used for cache invalidation."""

    def get_many(self, term_ids: Iterable[str]) -> list[Term]:
        by_id = {t.id: t for t in self.all()}
        return [by_id[tid] for tid in term_ids if tid in by_id]

    def search(
        self,
        query: str | None = None,
        tag: str | None = None,
        difficulty: str | None = None,
        limit: int = 20,
        offset: int = 0,
    ) -> tuple[list[Term], int]:
        terms = self.all()
        if tag:
            terms = [t for t in terms if tag in t.tags]
        if difficulty:
            terms = [t for t in terms if t.difficulty == difficulty]
        if query:
            q = query.lower()
            terms = [
                t
                for t in terms
                if q in t.term.lower()
                or q in t.short_summary.lower()
                or any(q in alias.lower() for alias in t.aliases)
            ]
        total = len(terms)
        return terms[offset : offset + limit], total


class JsonTermRepository(TermRepository):
    def __init__(self, path: Path) -> None:
        self._path = path
        self._terms: list[Term] | None = None
        self._by_id: dict[str, Term] | None = None
        self._hash: str | None = None
        self._load()

    def _load(self) -> None:
        with self._path.open("r", encoding="utf-8") as f:
            raw = json.load(f)
        self._terms = [Term.model_validate(item) for item in raw]
        self._by_id = {t.id: t for t in self._terms}
        self._hash = hashlib.sha256(
            json.dumps(raw, sort_keys=True, ensure_ascii=True).encode("utf-8")
        ).hexdigest()

    def all(self) -> list[Term]:
        if self._terms is None:
            self._load()
        return self._terms or []

    def get(self, term_id: str) -> Term | None:
        if self._by_id is None:
            self._load()
        return self._by_id.get(term_id) if self._by_id else None

    def content_hash(self) -> str:
        if self._hash is None:
            self._load()
        return self._hash or ""
