from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.hitl import HITLTask, HITLTaskRead, HITLResolveRequest
from app.models.account import Account

router = APIRouter()

@router.get("/queue")
def get_hitl_queue(status: Optional[str] = "PENDING", session: Session = Depends(get_session)):
    query = select(HITLTask)
    if status:
        query = query.where(HITLTask.status == status)
    tasks = session.exec(query.order_by(HITLTask.created_at.desc())).all()
    
    # Enrich tasks with account information
    results = []
    for task in tasks:
        acc = session.get(Account, task.account_id)
        task_dict = task.dict()
        task_dict["customer_name"] = acc.customer_name if acc else "Unknown"
        task_dict["outstanding_amount"] = acc.outstanding_amount if acc else 0.0
        results.append(task_dict)
    return results

@router.post("/resolve/{task_id}")
def resolve_hitl_task(task_id: str, req: HITLResolveRequest, session: Session = Depends(get_session)):
    task = session.get(HITLTask, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="HITL Task not found")
        
    task.status = req.decision
    task.reviewer_notes = req.reviewer_notes
    task.resolved_at = datetime.utcnow()
    
    acc = session.get(Account, task.account_id)
    if acc:
        if req.decision == "APPROVED":
            acc.status = "SETTLED" if task.proposed_discount_pct >= 0.20 else "IN_RECOVERY"
        elif req.decision == "REJECTED":
            acc.status = "IN_RECOVERY"
        session.add(acc)
        
    session.add(task)
    session.commit()
    session.refresh(task)
    return {"message": f"HITL Task successfully resolved as {req.decision}", "task": task}
