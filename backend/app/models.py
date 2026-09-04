from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, HttpUrl, field_validator


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class CodeExample(BaseModel):
    language: str = Field(..., description="Programming language, e.g. python")
    code: str = Field(..., description="Source code shown in the playground")


class Reference(BaseModel):
    label: str
    url: HttpUrl


class Term(BaseModel):
    id: str = Field(..., pattern=r"^[a-z0-9]+(-[a-z0-9]+)*$")
    term: str = Field(..., min_length=1)
    aliases: list[str] = Field(default_factory=list)
    short_summary: str = Field(..., min_length=10)
    definition: str = Field(..., min_length=20)
    example: str | None = None
    difficulty: Difficulty
    related_terms: list[str] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)
    diagram_mermaid: str | None = None
    code_example: CodeExample | None = None
    references: list[Reference] = Field(default_factory=list)

    @field_validator("aliases", "tags", "related_terms", mode="before")
    @classmethod
    def ensure_list(cls, value: Any) -> list[str]:
        if value is None:
            return []
        return list(value)


class TermSummary(BaseModel):
    id: str
    term: str
    short_summary: str
    difficulty: Difficulty
    tags: list[str]
    has_diagram: bool
    has_code: bool

    @classmethod
    def from_term(cls, term: Term) -> "TermSummary":
        return cls(
            id=term.id,
            term=term.term,
            short_summary=term.short_summary,
            difficulty=term.difficulty,
            tags=term.tags,
            has_diagram=term.diagram_mermaid is not None,
            has_code=term.code_example is not None,
        )


class AskRequest(BaseModel):
    query: str = Field(..., min_length=1)
    term_id: str | None = None
    include_sections: list[str] | None = Field(
        default=None,
        description="Sections to include: definition, example, code. Null means all.",
    )


class MatchedTerm(BaseModel):
    term_id: str
    term: str
    score: float
    confidence: str
    difficulty: Difficulty


class AskMeta(BaseModel):
    match: MatchedTerm
    intent: str
    alternatives: list[MatchedTerm]


class IntentRequest(BaseModel):
    text: str = Field(..., min_length=1)


class IntentResponse(BaseModel):
    available: bool
    intent: str | None = None
    intent_confidence: float | None = None
    predicted_term_id: str | None = None
    term_confidence: float | None = None
    top_intents: list[dict[str, Any]] = Field(default_factory=list)
