"""Train the optional TF-IDF + SVM intent/term classifier.

Usage:
    cd backend
    python scripts/train_intent_model.py
"""

from __future__ import annotations

import random
import sys
from pathlib import Path

# Make imports work when running from the backend directory.
BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import get_settings
from app.services.classifier import IntentClassifier
from app.services.repository import JsonTermRepository

random.seed(42)

INTENT_TEMPLATES: dict[str, list[str]] = {
    "define": [
        "what is {term}",
        "define {term}",
        "explain {term}",
        "tell me about {term}",
        "describe {term}",
        "what does {term} mean",
        "overview of {term}",
    ],
    "example": [
        "give me an example of {term}",
        "example of {term}",
        "how does {term} work in practice",
        "real world example of {term}",
        "illustrate {term}",
        "show an example for {term}",
    ],
    "code": [
        "show me code for {term}",
        "code example for {term}",
        "implement {term}",
        "how to write {term} in python",
        "code snippet for {term}",
        "programming example of {term}",
    ],
    "compare": [
        "difference between {term} and {other}",
        "compare {term} and {other}",
        "{term} vs {other}",
        "{term} versus {other}",
        "when to use {term} instead of {other}",
    ],
    "diagram": [
        "draw {term}",
        "diagram of {term}",
        "visualize {term}",
        "show a diagram for {term}",
        "flowchart of {term}",
    ],
    "chitchat": [
        "hello",
        "hi",
        "how are you",
        "thanks",
        "thank you",
        "what can you do",
        "who are you",
        "help",
    ],
}


def _generate_intent_samples(terms: list[dict]) -> tuple[list[str], list[str]]:
    texts: list[str] = []
    labels: list[str] = []

    term_names = [t["term"] for t in terms]

    for intent, templates in INTENT_TEMPLATES.items():
        if intent == "chitchat":
            texts.extend(templates)
            labels.extend([intent] * len(templates))
            continue

        for t in terms:
            term_name = t["term"]
            aliases = t.get("aliases", [])
            names = [term_name, *aliases]
            for template in templates:
                if "{other}" in template:
                    others = [n for n in term_names if n.lower() != term_name.lower()]
                    if not others:
                        continue
                    other = random.choice(others)
                    for name in names:
                        texts.append(template.format(term=name, other=other))
                        labels.append(intent)
                else:
                    for name in names:
                        texts.append(template.format(term=name))
                        labels.append(intent)

    return texts, labels


def _generate_term_samples(terms: list[dict]) -> tuple[list[str], list[str]]:
    texts: list[str] = []
    labels: list[str] = []

    templates = [
        "{term}",
        "what is {term}",
        "explain {term}",
        "{summary}",
        "{term} {summary}",
        "definition of {term}",
    ]

    for t in terms:
        term_id = t["id"]
        term_name = t["term"]
        aliases = t.get("aliases", [])
        summary = t.get("short_summary", "")
        definition = t.get("definition", "")[:200]

        names = [term_name, *aliases]
        for name in names:
            for template in templates:
                text = template.format(term=name, summary=summary)
                texts.append(text)
                labels.append(term_id)
                if definition:
                    texts.append(f"{name} {definition}")
                    labels.append(term_id)

    return texts, labels


def main() -> None:
    settings = get_settings()
    repo = JsonTermRepository(settings.terms_path)
    terms = [t.model_dump() for t in repo.all()]

    if not terms:
        print("No terms found; cannot train classifier.")
        sys.exit(1)

    intent_texts, intent_labels = _generate_intent_samples(terms)
    term_texts, term_labels = _generate_term_samples(terms)

    print(f"Intent samples: {len(intent_texts)}")
    print(f"Term samples: {len(term_texts)}")

    classifier = IntentClassifier(repo, settings)
    classifier.fit_and_save(intent_texts, intent_labels, term_texts, term_labels)

    print(f"Saved model to {settings.intent_model_file}")
    print(f"Saved meta to {settings.intent_meta_file}")


if __name__ == "__main__":
    main()
