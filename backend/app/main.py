import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, text
from app.core.config import settings
from app.core.database import init_db, get_session
from app.api.v1.api_router import api_router
from data.seed_events import seed_database_events

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Autonomous Revenue Recovery Agent for Razorpay Buildathon Track 3",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Parse CORS Allowed Origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    seed_database_events(50)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to RecoverAI — Autonomous Revenue Recovery Agent (Razorpay Track 3)",
        "public_webhook_endpoint": "/api/v1/webhooks/razorpay",
        "docs": "/docs",
        "status": "online"
    }

@app.get("/health")
def health_check(session: Session = Depends(get_session)):
    """Health check endpoint for production uptime monitors (Render / Railway)."""
    try:
        # Check DB connectivity
        session.exec(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"degraded: {str(e)}"
        
    return {
        "status": "healthy",
        "service": "RecoverAI API",
        "version": "1.0.0",
        "database": db_status
    }
