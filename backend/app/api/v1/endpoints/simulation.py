from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlmodel import Session
from app.core.database import get_session
from app.simulator.benchmark_runner import run_benchmark_simulation
from app.models.simulation import BenchmarkRun, BenchmarkRunRead

router = APIRouter()

class BatchSimRequest(BaseModel):
    event_count: int = 10000

@router.post("/run-batch")
def run_batch_simulation(req: BatchSimRequest, session: Session = Depends(get_session)):
    results = run_benchmark_simulation(event_count=req.event_count)
    
    # Record benchmark run in DB
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
    
    return results
