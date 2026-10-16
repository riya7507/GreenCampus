"""
Database Engine & Session Management
Initializes the SQLAlchemy engine and provides request-scoped database sessions.
"""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.core.config import settings

# Engine configuration:
# pool_pre_ping=True checks connection health before issuing queries to prevent stale connection errors.
# echo is enabled only in development for SQL transparency.
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=(settings.ENVIRONMENT == "development"),
)

# Thread-safe session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a database session per HTTP request.
    Guarantees session termination in the finally block.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
