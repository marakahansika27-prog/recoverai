from fastapi import APIRouter
from app.api.v1.endpoints import webhooks, transactions, agent, decisions, policies, simulation, audit, analytics

api_router = APIRouter()

api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(decisions.router, prefix="/decisions", tags=["decisions"])
api_router.include_router(policies.router, prefix="/policies", tags=["policies"])
api_router.include_router(simulation.router, prefix="/simulation", tags=["simulation"])
api_router.include_router(audit.router, prefix="/audit", tags=["audit"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
