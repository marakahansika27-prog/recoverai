import logging
from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

SQLITE_FALLBACK_URL = "sqlite:///./recoverai_revenue.db"

def _create_engine_instance(url_str: str):
    is_sqlite = "sqlite" in url_str
    try:
        return create_engine(
            url_str,
            connect_args={"check_same_thread": False} if is_sqlite else {},
            pool_pre_ping=True if not is_sqlite else False,
        )
    except Exception as e:
        logger.warning(f"[DEMO EMERGENCY] Engine creation failed for {url_str[:15]}...: {e}")
        return create_engine(
            SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False},
            pool_pre_ping=False
        )

# Module-level engine with safe fallback initialization
try:
    engine = _create_engine_instance(settings.sync_database_url)
except Exception:
    engine = _create_engine_instance(SQLITE_FALLBACK_URL)

def init_db():
    global engine
    try:
        # Attempt metadata creation on primary engine
        SQLModel.metadata.create_all(engine)
        # Test connection query ping
        with engine.connect() as conn:
            pass
    except Exception as e:
        # Guaranteed fallback to local SQLite for demo resilience
        msg = "External database connection failed; initializing local SQLite fallback for hackathon demo."
        logger.warning(msg)
        print(f"[DEMO RESILIENCE] {msg}")
        engine = _create_engine_instance(SQLITE_FALLBACK_URL)
        SQLModel.metadata.create_all(engine)

def get_session():
    global engine
    try:
        with Session(engine) as session:
            yield session
    except Exception:
        # Emergency session fallback to SQLite
        engine = _create_engine_instance(SQLITE_FALLBACK_URL)
        SQLModel.metadata.create_all(engine)
        with Session(engine) as session:
            yield session
