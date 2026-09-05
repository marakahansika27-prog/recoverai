import os
import logging
from sqlmodel import create_engine, Session, SQLModel, text
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Consistently anchored absolute path for SQLite fallback DB
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DB_PATH = os.path.join(BASE_DIR, "recoverai_revenue.db")
SQLITE_FALLBACK_URL = f"sqlite:///{DB_PATH}"

_active_engine = None

def _create_engine_instance(url_str: str):
    is_sqlite = "sqlite" in url_str
    return create_engine(
        url_str,
        connect_args={"check_same_thread": False} if is_sqlite else {},
        pool_pre_ping=True if not is_sqlite else False,
    )

def get_engine():
    global _active_engine
    if _active_engine is not None:
        return _active_engine

    target_url = getattr(settings, "sync_database_url", None) or SQLITE_FALLBACK_URL

    if "sqlite" not in target_url:
        try:
            test_eng = _create_engine_instance(target_url)
            with test_eng.connect() as conn:
                conn.exec_driver_sql("SELECT 1")
            _active_engine = test_eng
            return _active_engine
        except Exception as e:
            msg = f"Primary DB connection unreachable ({e}); falling back to local SQLite at {DB_PATH}"
            logger.warning(msg)
            print(f"[DEMO RESILIENCE] {msg}")

    _active_engine = _create_engine_instance(SQLITE_FALLBACK_URL)
    return _active_engine

# Compatibility export
engine = get_engine()

def init_db():
    eng = get_engine()

    # Import each model independently so one optional model import
    # cannot prevent the core payment_events table from being registered.
    model_modules = [
        "app.models.event",
        "app.models.interaction",   # must precede hitl (FK dependency)
        "app.models.decision",
        "app.models.policy",
        "app.models.audit",
        "app.models.simulation",
        "app.models.account",
        "app.models.hitl",
    ]

    for module_name in model_modules:
        try:
            __import__(module_name)
        except Exception as e:
            logger.warning(f"Model import notice for {module_name}: {e}")

    try:
        SQLModel.metadata.create_all(eng)
    except Exception as e:
        logger.warning(f"Metadata creation notice: {e}")

        global _active_engine
        _active_engine = _create_engine_instance(SQLITE_FALLBACK_URL)

        SQLModel.metadata.create_all(_active_engine)
def get_session():
    eng = get_engine()
    with Session(eng) as session:
        yield session
