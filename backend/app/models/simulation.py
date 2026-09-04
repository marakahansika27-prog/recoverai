import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field

class BenchmarkRunBase(SQLModel):
    total_events: int
    total_revenue_at_risk: float
    baseline_recovered: float
    baseline_recovery_rate_pct: float
    recoverai_recovered: float
    recoverai_recovery_rate_pct: float
    incremental_lift_amount: float
    blocked_actions: int
    hitl_escalations: int
    stopping_rule_activations: int

class BenchmarkRun(BenchmarkRunBase, table=True):
    __tablename__ = "benchmark_runs"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BenchmarkRunRead(BenchmarkRunBase):
    id: str
    created_at: datetime
