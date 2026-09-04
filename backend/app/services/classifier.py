from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer

from app.config import Settings
from app.services.repository import TermRepository


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", text.lower()).strip())


class IntentClassifier:
    """Lightweight TF-IDF + LinearSVM classifier for intent and term prediction.

    The model artifact is optional: if it is missing or corrupt, ``predict``
    returns ``available=False`` so the rest of the app keeps working.
    """

    def __init__(self, repository: TermRepository, settings: Settings) -> None:
        self._repo = repository
        self._settings = settings
        self._vectorizer: TfidfVectorizer | None = None
        self._intent_clf: Any | None = None
        self._term_clf: Any | None = None
        self._term_ids: list[str] = []
        self._meta: dict[str, Any] = {}
        self._available = False

    def load(self) -> None:
        model_file = self._settings.intent_model_file
        meta_file = self._settings.intent_meta_file
        if not model_file.exists() or not meta_file.exists():
            return

        try:
            data = joblib.load(model_file)
            self._vectorizer = data["vectorizer"]
            self._intent_clf = data["intent_clf"]
            self._term_clf = data["term_clf"]
            self._term_ids = data.get("term_ids", [])
            with meta_file.open("r", encoding="utf-8") as f:
                self._meta = json.load(f)
            self._available = True
        except Exception:
            self._available = False

    @property
    def is_ready(self) -> bool:
        return self._available

    @property
    def meta(self) -> dict[str, Any]:
        return self._meta

    def predict(self, text: str) -> dict[str, Any]:
        if not self._available or self._vectorizer is None:
            return {
                "available": False,
                "intent": None,
                "intent_confidence": None,
                "predicted_term_id": None,
                "term_confidence": None,
                "top_intents": [],
            }

        X = self._vectorizer.transform([_normalize(text)])

        intent_proba = self._intent_clf.predict_proba(X)[0]
        intent_idx = int(np.argmax(intent_proba))
        intent_label = self._intent_clf.classes_[intent_idx]

        term_proba = self._term_clf.predict_proba(X)[0]
        term_idx = int(np.argmax(term_proba))
        predicted_term_id = self._term_ids[term_idx] if term_idx < len(self._term_ids) else None

        top_indices = np.argsort(-intent_proba)[:3]
        top_intents = [
            {
                "intent": self._intent_clf.classes_[i],
                "confidence": round(float(intent_proba[i]), 4),
            }
            for i in top_indices
        ]

        return {
            "available": True,
            "intent": intent_label,
            "intent_confidence": round(float(intent_proba[intent_idx]), 4),
            "predicted_term_id": predicted_term_id,
            "term_confidence": round(float(term_proba[term_idx]), 4),
            "top_intents": top_intents,
        }

    def fit_and_save(
        self,
        intent_texts: list[str],
        intent_labels: list[str],
        term_texts: list[str],
        term_labels: list[str],
    ) -> None:
        """Train and persist both classifiers."""
        artifacts_dir = self._settings.artifacts_dir
        artifacts_dir.mkdir(parents=True, exist_ok=True)

        vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            min_df=1,
            max_df=1.0,
        )

        from sklearn.calibration import CalibratedClassifierCV
        from sklearn.svm import LinearSVC

        X_intent = vectorizer.fit_transform([_normalize(t) for t in intent_texts])
        intent_clf = CalibratedClassifierCV(LinearSVC(dual="auto"), cv=2)
        intent_clf.fit(X_intent, intent_labels)

        term_ids = sorted(set(term_labels))
        term_id_to_index = {tid: i for i, tid in enumerate(term_ids)}
        y_term = np.array([term_id_to_index[tid] for tid in term_labels])

        X_term = vectorizer.transform([_normalize(t) for t in term_texts])
        term_clf = CalibratedClassifierCV(LinearSVC(dual="auto"), cv=2)
        term_clf.fit(X_term, y_term)

        joblib.dump(
            {
                "vectorizer": vectorizer,
                "intent_clf": intent_clf,
                "term_clf": term_clf,
                "term_ids": term_ids,
            },
            self._settings.intent_model_file,
        )

        meta = {
            "intent_classes": list(intent_clf.classes_),
            "num_terms": len(term_ids),
            "num_intent_samples": len(intent_texts),
            "num_term_samples": len(term_texts),
        }
        with self._settings.intent_meta_file.open("w", encoding="utf-8") as f:
            json.dump(meta, f, indent=2)

        self._vectorizer = vectorizer
        self._intent_clf = intent_clf
        self._term_clf = term_clf
        self._term_ids = term_ids
        self._meta = meta
        self._available = True
