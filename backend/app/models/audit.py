import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field

class AuditLogBase(SQLModel):
    event_id: str
    actor: str  # AGENT, POLICY_ENGINE, EXECUTOR, HUMAN_OFFICER
    action_taken: str
    details_json: str  # JSON payload string

class AuditLog(AuditLogBase, table=True):
    __tablename__ = "audit_logs"
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class AuditLogRead(AuditLogBase):
    id: str
    timestamp: datetime
