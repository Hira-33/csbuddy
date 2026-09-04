from app.config import get_settings
from app.services.classifier import IntentClassifier
from app.services.matcher import MatchEngine
from app.services.repository import JsonTermRepository, TermRepository


_repo_instance: TermRepository | None = None
_engine_instance: MatchEngine | None = None
_classifier_instance: IntentClassifier | None = None


def get_repository() -> TermRepository:
    global _repo_instance
    if _repo_instance is None:
        _repo_instance = JsonTermRepository(get_settings().terms_path)
    return _repo_instance


def get_match_engine() -> MatchEngine:
    global _engine_instance
    if _engine_instance is None:
        settings = get_settings()
        _engine_instance = MatchEngine(get_repository(), settings)
        _engine_instance.load_or_build()
    return _engine_instance


def get_classifier() -> IntentClassifier:
    global _classifier_instance
    if _classifier_instance is None:
        settings = get_settings()
        _classifier_instance = IntentClassifier(get_repository(), settings)
        _classifier_instance.load()
    return _classifier_instance


def warm_models() -> None:
    get_match_engine()
    get_classifier()
