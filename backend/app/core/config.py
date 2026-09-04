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
        """Normalize PostgreSQL URLs and require SSL for Supabase."""
        url = self.DATABASE_URL

        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)

        if "supabase.com" in url and "sslmode" not in url:
            separator = "&" if "?" in url else "?"
            url = f"{url}{separator}sslmode=require"

        return url

    class Config:
        case_sensitive = True

settings = Settings()
