from __future__ import annotations

import asyncio
import re

from app.config import Settings
from app.models import AskRequest, Term, TermSummary
from app.services.matcher import MatchEngine
from app.services.repository import TermRepository
from app.utils.sse import sse_event


class Explainer:
    def __init__(
        self,
        repository: TermRepository,
        engine: MatchEngine,
        settings: Settings,
    ) -> None:
        self._repo = repository
        self._engine = engine
        self._settings = settings

    async def stream(self, request: AskRequest):
        try:
            if request.term_id:
                term = self._repo.get(request.term_id)
                if term is None:
                    yield sse_event(
                        "error",
                        {"message": f"Term '{request.term_id}' not found."},
                    )
                    return
                top_matches = [
                    {
                        "term_id": term.id,
                        "term": term.term,
                        "score": 1.0,
                        "confidence": "confident",
                        "difficulty": term.difficulty.value,
                    }
                ]
            else:
                top_matches = self._engine.match(request.query, top_k=5)

            if not top_matches:
                yield sse_event(
                    "error",
                    {"message": "No matching terms found."},
                )
                return

            match = top_matches[0]
            alternatives = top_matches[1:4]
            intent = self._detect_intent(request)

            yield sse_event(
                "meta",
                {"match": match, "intent": intent, "alternatives": alternatives},
            )

            if match["confidence"] == "no_match":
                text = "I'm not sure what term you mean. Did you ask about one of these?"
                for alt in alternatives:
                    text += f"\n- {alt['term']}"
                async for chunk in self._stream_text(text):
                    yield chunk
                yield sse_event("done", {})
                return

            term = self._repo.get(match["term_id"])
            if term is None:
                yield sse_event(
                    "error",
                    {"message": f"Matched term '{match['term_id']}' is missing."},
                )
                return

            sections = self._select_sections(intent, request.include_sections)

            async for chunk in self._stream_text(
                f"**{term.term}** — {term.short_summary}\n\n"
            ):
                yield chunk

            if "definition" in sections:
                async for chunk in self._stream_text(term.definition + "\n\n"):
                    yield chunk

            if "example" in sections and term.example:
                async for chunk in self._stream_text(
                    f"**Example:** {term.example}\n\n"
                ):
                    yield chunk

            if "code" in sections and term.code_example:
                async for chunk in self._stream_text(
                    f"**Code ({term.code_example.language}):**\n{term.code_example.code}\n\n"
                ):
                    yield chunk

            if "diagram" in sections and term.diagram_mermaid:
                yield sse_event("diagram", {"mermaid": term.diagram_mermaid})

            if "code" in sections and term.code_example:
                yield sse_event("code", term.code_example.model_dump())

            related = self._repo.get_many(term.related_terms)
            yield sse_event(
                "related",
                {
                    "related": [
                        TermSummary.from_term(t).model_dump() for t in related
                    ]
                },
            )
            yield sse_event("done", {})

        except Exception as exc:
            yield sse_event("error", {"message": str(exc)})

    async def _stream_text(self, text: str, delay: float = 0.015):
        chunks = re.findall(r"\S+\s*", text)
        for chunk in chunks:
            yield sse_event("token", {"text": chunk})
            await asyncio.sleep(delay)

    def _detect_intent(self, request: AskRequest) -> str:
        if request.include_sections:
            return "custom"
        q = request.query.lower()
        if any(word in q for word in ("diagram", "chart", "flowchart", "visualize")):
            return "diagram"
        if any(word in q for word in ("code", "implement", "write", "function")):
            return "code"
        if any(word in q for word in ("example", "illustrate", "analogy")):
            return "example"
        if any(word in q for word in ("compare", "difference", "vs", "versus")):
            return "compare"
        return "define"

    def _select_sections(
        self, intent: str, include_sections: list[str] | None
    ) -> list[str]:
        if include_sections:
            return include_sections
        if intent == "diagram":
            return ["definition", "diagram"]
        if intent == "code":
            return ["definition", "code"]
        if intent == "example":
            return ["definition", "example"]
        return ["definition", "example", "code"]
