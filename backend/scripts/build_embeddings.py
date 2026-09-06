import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import get_settings
from app.services.matcher import MatchEngine
from app.services.repository import JsonTermRepository


def main() -> int:
    settings = get_settings()
    settings.artifacts_dir.mkdir(parents=True, exist_ok=True)
    repo = JsonTermRepository(settings.terms_path)
    engine = MatchEngine(repo, settings)
    print(f"Building embeddings for {len(repo.all())} terms...")
    print(f"Model: {settings.embedding_model}")
    engine.build()
    print(f"Saved to {settings.embeddings_file}")
    print(f"Dimensions: {engine.dim}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
