from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
from sentence_transformers import SentenceTransformer

from app.config import Settings
from app.models import Term
from app.services.repository import TermRepository


def _embed_text(term: Term) -> str:
    parts = [
        term.term,
        *term.aliases,
        term.short_summary,
        " ".join(term.tags),
        term.definition[:400],
    ]
    return " | ".join(p for p in parts if p)


class MatchEngine:
    def __init__(self, repository: TermRepository, settings: Settings) -> None:
        self._repo = repository
        self._settings = settings
        self._model: SentenceTransformer | None = None
        self._term_ids: list[str] = []
        self._matrix: np.ndarray | None = None

    def _ensure_model(self) -> SentenceTransformer:
        if self._model is None:
            self._model = SentenceTransformer(self._settings.embedding_model)
        return self._model

    def load_or_build(self) -> None:
        artifacts_dir = self._settings.artifacts_dir
        artifacts_dir.mkdir(parents=True, exist_ok=True)

        embeddings_file = self._settings.embeddings_file
        meta_file = self._settings.embeddings_meta_file

        current_hash = self._repo.content_hash()

        if embeddings_file.exists() and meta_file.exists():
            with meta_file.open("r", encoding="utf-8") as f:
                meta = json.load(f)
            if (
                meta.get("model_name") == self._settings.embedding_model
                and meta.get("db_hash") == current_hash
            ):
                self._term_ids = meta.get("term_ids", [])
                self._matrix = np.load(embeddings_file)
                return

        self.build()

    def build(self) -> None:
        model = self._ensure_model()
        terms = self._repo.all()
        self._term_ids = [t.id for t in terms]
        texts = [_embed_text(t) for t in terms]

        self._matrix = model.encode(
            texts,
            normalize_embeddings=True,
            show_progress_bar=True,
            convert_to_numpy=True,
        )

        meta = {
            "model_name": self._settings.embedding_model,
            "dim": int(self._matrix.shape[1]),
            "term_ids": self._term_ids,
            "db_hash": self._repo.content_hash(),
        }

        np.save(self._settings.embeddings_file, self._matrix)
        with self._settings.embeddings_meta_file.open("w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

    def _alias_match_boost(self, query: str, term: Term) -> float:
        q = query.lower()
        tokens = re.findall(r"\b\w+\b", q)
        names = [term.term.lower(), *[a.lower() for a in term.aliases]]
        for name in names:
            if name in q or any(name == token for token in tokens):
                return self._settings.alias_boost
        return 0.0

    def match(self, query: str, top_k: int | None = None) -> list[dict]:
        if self._matrix is None:
            self.load_or_build()

        if not self._matrix is not None and len(self._matrix) == 0:
            return []

        model = self._ensure_model()
        q_vec = model.encode([query], normalize_embeddings=True, convert_to_numpy=True)
        q_vec = q_vec[0]

        scores: np.ndarray = self._matrix @ q_vec
        scores = np.asarray(scores).copy()

        terms = self._repo.all()
        term_by_id = {t.id: t for t in terms}

        for idx, term_id in enumerate(self._term_ids):
            term = term_by_id.get(term_id)
            if term:
                scores[idx] = min(1.0, scores[idx] + self._alias_match_boost(query, term))

        k = top_k or self._settings.match_top_k
        k = min(k, len(scores))

        top_indices = np.argpartition(-scores, k - 1)[:k]
        top_indices = top_indices[np.argsort(-scores[top_indices])]

        results = []
        for idx in top_indices:
            term_id = self._term_ids[idx]
            term = term_by_id.get(term_id)
            if term is None:
                continue
            score = float(scores[idx])
            results.append(
                {
                    "term_id": term_id,
                    "term": term.term,
                    "score": score,
                    "confidence": self._confidence(score),
                    "difficulty": term.difficulty.value,
                }
            )
        return results

    def _confidence(self, score: float) -> str:
        if score >= self._settings.match_confident_threshold:
            return "confident"
        if score >= self._settings.match_ambiguous_threshold:
            return "ambiguous"
        return "no_match"

    @property
    def is_ready(self) -> bool:
        return self._matrix is not None

    @property
    def dim(self) -> int:
        if self._matrix is None:
            return 0
        return int(self._matrix.shape[1])

    @property
    def model_name(self) -> str:
        return self._settings.embedding_model
