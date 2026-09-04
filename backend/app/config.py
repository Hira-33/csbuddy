from functools import lru_cache
from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "CSBuddy"
    version: str = "0.1.0"
    debug: bool = False

    terms_path: Path = ROOT / "data" / "terms.json"
    artifacts_dir: Path = ROOT / "artifacts"
    embeddings_file: Path = ROOT / "artifacts" / "term_embeddings.npy"
    embeddings_meta_file: Path = ROOT / "artifacts" / "embeddings_meta.json"
    intent_model_file: Path = ROOT / "artifacts" / "intent_svm.joblib"
    intent_meta_file: Path = ROOT / "artifacts" / "intent_meta.json"

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    match_confident_threshold: float = 0.55
    match_ambiguous_threshold: float = 0.35
    match_top_k: int = 5
    alias_boost: float = 0.15

    # Comma-separated list of allowed frontend origins. Defaults to the Vite
    # dev server; set explicitly in production (e.g. https://csbuddy.vercel.app).
    cors_origins: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    admin_token: str | None = None

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, list):
            return [origin.strip() for origin in value if origin.strip()]
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return []

    @property
    def cors_allow_credentials(self) -> bool:
        return "*" not in self.cors_origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
