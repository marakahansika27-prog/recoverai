from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.core.database import get_session
from app.models.account import Account, AccountCreate, AccountRead, AccountUpdate
from app.ml.predict import predict_account_scores

router = APIRouter()

@router.get("/", response_model=List[AccountRead])
def get_accounts(
    status: Optional[str] = None,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    query = select(Account)
    if status:
        query = query.where(Account.status == status)
    return session.exec(query.limit(limit)).all()

@router.get("/{account_id}", response_model=AccountRead)
def get_account_by_id(account_id: str, session: Session = Depends(get_session)):
    acc = session.get(Account, account_id)
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    return acc

@router.post("/", response_model=AccountRead)
def create_account(account_in: AccountCreate, session: Session = Depends(get_session)):
    acc = Account.from_orm(account_in)
    
    # Calculate ML propensity & risk scores on creation
    scores = predict_account_scores(acc.dict())
    acc.risk_score = scores["risk_score"]
    acc.propensity_to_pay = scores["propensity_to_pay"]
    
    session.add(acc)
    session.commit()
    session.refresh(acc)
    return acc

@router.post("/score-all")
def rescore_all_accounts(session: Session = Depends(get_session)):
    accounts = session.exec(select(Account)).all()
    updated = 0
    for acc in accounts:
        scores = predict_account_scores(acc.dict())
        acc.risk_score = scores["risk_score"]
        acc.propensity_to_pay = scores["propensity_to_pay"]
        session.add(acc)
        updated += 1
    session.commit()
    return {"message": f"Successfully rescored {updated} accounts."}
