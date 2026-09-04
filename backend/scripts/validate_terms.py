import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TERMS_PATH = ROOT / "data" / "terms.json"


def validate_terms() -> list[str]:
    errors: list[str] = []

    with TERMS_PATH.open("r", encoding="utf-8") as f:
        try:
            raw_terms = json.load(f)
        except json.JSONDecodeError as exc:
            return [f"terms.json is not valid JSON: {exc}"]

    if not isinstance(raw_terms, list):
        return ["terms.json must contain a JSON array"]

    ids: set[str] = set()
    id_positions: dict[str, int] = {}

    for idx, term in enumerate(raw_terms, start=1):
        if not isinstance(term, dict):
            errors.append(f"Entry #{idx} is not an object")
            continue

        term_id = term.get("id")
        if not term_id:
            errors.append(f"Entry #{idx} is missing 'id'")
            continue

        if term_id in ids:
            errors.append(f"Duplicate id '{term_id}' at entry #{idx} and #{id_positions[term_id]}")
        else:
            ids.add(term_id)
            id_positions[term_id] = idx

        required = ["term", "short_summary", "definition", "difficulty"]
        for field in required:
            if not term.get(field):
                errors.append(f"Term '{term_id}' is missing required field '{field}'")

        if "related_terms" in term:
            related = term["related_terms"] or []
            for related_id in related:
                if related_id not in ids:
                    # We also need to check ids that appear later in the file,
                    # so collect all ids first, then validate. Here we do a
                    # first pass; a second pass below catches dangling refs.
                    pass

    # Second pass: ensure all related_terms resolve.
    for idx, term in enumerate(raw_terms, start=1):
        term_id = term.get("id")
        related = term.get("related_terms") or []
        for related_id in related:
            if related_id not in ids:
                errors.append(f"Term '{term_id}' references unknown term '{related_id}'")

    return errors


def main() -> int:
    print(f"Validating {TERMS_PATH}...")
    errors = validate_terms()

    if errors:
        print("Validation FAILED:")
        for err in errors:
            print(f"  - {err}")
        return 1

    with TERMS_PATH.open("r", encoding="utf-8") as f:
        terms = json.load(f)

    print(f"Validation OK: {len(terms)} terms, all IDs unique, all related_terms resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
