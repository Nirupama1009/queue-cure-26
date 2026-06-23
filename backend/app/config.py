from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os


BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = Path(os.getenv("QUEUE_CURE_DB_PATH", BASE_DIR / "queue_cure.db"))


@dataclass(frozen=True)
class AppSettings:
    app_name: str = "Queue Cure '26"
    api_prefix: str = ""
    cors_origins: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    )
    default_consultation_minutes: int = 8
    default_theme: str = "light"


settings = AppSettings()
