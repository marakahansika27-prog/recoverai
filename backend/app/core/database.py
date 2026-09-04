from sqlmodel import create_engine, Session, SQLModel
from app.core.config import settings

is_sqlite = "sqlite" in settings.sync_database_url

engine = create_engine(
    settings.sync_database_url,
    connect_args={"check_same_thread": False} if is_sqlite else {},
    pool_pre_ping=True if not is_sqlite else False,
)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
