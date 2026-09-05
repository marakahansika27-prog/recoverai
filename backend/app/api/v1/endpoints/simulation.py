from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session, select
from app.core.database import get_session, get_engine
from app.simulator.benchmark_runner import run_benchmark_simulation
from app.models.simulation import BenchmarkRun, BenchmarkRunRead

router = APIRouter()

class BatchSimRequest(BaseModel):
    event_count: int = 10000

@router.post("/run-batch")
def run_batch_simulation(
    req: Optional[BatchSimRequest] = None, 
    session: Session = Depends(get_session)
):
    event_count = req.event_count if (req and req.event_count) else 10000
    results = run_benchmark_simulation(event_count=event_count)
    
    # Record benchmark run in DB safely using active engine
    try:
        engine = get_engine()
        BenchmarkRun.metadata.create_all(engine)
        bench = BenchmarkRun(
            total_events=results["total_events"],
            total_revenue_at_risk=results["total_revenue_at_risk"],
            baseline_recovered=results["baseline"]["recovered_revenue"],
            baseline_recovery_rate_pct=results["baseline"]["recovery_rate_pct"],
            recoverai_recovered=results["recoverai"]["recovered_revenue"],
            recoverai_recovery_rate_pct=results["recoverai"]["recovery_rate_pct"],
            incremental_lift_amount=results["recoverai"]["incremental_lift_amount"],
            blocked_actions=results["recoverai"]["blocked_actions"],
            hitl_escalations=results["recoverai"]["hitl_escalations"],
            stopping_rule_activations=results["recoverai"]["stopping_rule_activations"]
        )
        session.add(bench)
        session.commit()
        session.refresh(bench)
    except Exception as e:
        session.rollback()
        print(f"[BENCHMARK DB WARNING] Could not persist run to DB: {e}")
    
    return results

@router.get("/latest")
def get_latest_benchmark(session: Session = Depends(get_session)):
    try:
        engine = get_engine()
        BenchmarkRun.metadata.create_all(engine)
        run = session.exec(select(BenchmarkRun).order_by(BenchmarkRun.created_at.desc())).first()
        if not run:
            return None
        return {
            "total_events": run.total_events,
            "total_revenue_at_risk": run.total_revenue_at_risk,
            "baseline": {
                "attempted_value": run.total_revenue_at_risk,
                "recovered_revenue": run.baseline_recovered,
                "recovery_rate_pct": run.baseline_recovery_rate_pct
            },
            "recoverai": {
                "attempted_value": run.total_revenue_at_risk,
                "recovered_revenue": run.recoverai_recovered,
                "recovery_rate_pct": run.recoverai_recovery_rate_pct,
                "incremental_lift_amount": run.incremental_lift_amount,
                "blocked_actions": run.blocked_actions,
                "hitl_escalations": run.hitl_escalations,
                "stopping_rule_activations": run.stopping_rule_activations
            }
        }
    except Exception as e:
        print(f"[BENCHMARK LATEST WARNING] Could not fetch latest benchmark run: {e}")
        return None
