import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "RecoverAI — Autonomous Revenue Recovery Agent"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./recoverai_revenue.db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "razorpay-buildathon-track3-secret")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "whsec_test_razorpay_secret")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    @property
    def sync_database_url(self) -> str:
        """Fixes postgres:// URI prefix for SQLAlchemy 2.0 compatibility on Render/Supabase."""
        if self.DATABASE_URL.startswith("postgres://"):
            return self.DATABASE_URL.replace("postgres://", "postgresql://", 1)
        return self.DATABASE_URL

    class Config:
        case_sensitive = True

settings = Settings()
