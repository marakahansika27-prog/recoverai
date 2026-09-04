import logging
from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

SQLITE_FALLBACK_URL = "sqlite:///./recoverai_revenue.db"

def _create_engine_instance(url_str: str):
    is_sqlite = "sqlite" in url_str
    return create_engine(
        url_str,
        connect_args={"check_same_thread": False} if is_sqlite else {},
        pool_pre_ping=True if not is_sqlite else False,
    )

# Primary engine attempt using configured DATABASE_URL
engine = _create_engine_instance(settings.sync_database_url)

def init_db():
    global engine
    try:
        # Attempt metadata creation on primary engine
        SQLModel.metadata.create_all(engine)
        # Test connection with simple query ping
        with engine.connect() as conn:
            pass
    except Exception:
        # Graceful fallback to SQLite
        msg = "External database unavailable; using local SQLite fallback for demo mode."
        logger.warning(msg)
        print(f"[WARNING] {msg}")
        engine = _create_engine_instance(SQLITE_FALLBACK_URL)
        SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
