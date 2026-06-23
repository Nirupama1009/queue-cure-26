from __future__ import annotations

from .database import SessionLocal, engine
from .main import Base, bootstrap_seed


def seed() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        bootstrap_seed(db)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
