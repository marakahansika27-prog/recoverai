from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.models.event import PaymentEvent
from app.agent.loop import run_agent_loop

router = APIRouter()

class EvaluateRequest(BaseModel):
    event_id: str

@router.post("/evaluate")
def evaluate_event(req: EvaluateRequest, session: Session = Depends(get_session)):
    event = session.get(PaymentEvent, req.event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    output = run_agent_loop(event, session)
    return output
