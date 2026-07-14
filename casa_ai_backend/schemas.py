from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from database import MilestoneStatus, SiteLogStatus

# ─── PROJECTS ───────────────────────────────────────────────────────────────
class ProjectBase(BaseModel):
    name: str
    location: str
    rera_registration_number: str

class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# ─── MILESTONES ─────────────────────────────────────────────────────────────
class MilestoneBase(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = None
    target_date: datetime
    billing_trigger_stage: bool = False
    billing_amount: float = 0.0

class MilestoneOut(MilestoneBase):
    id: int
    status: MilestoneStatus
    actual_completion_date: Optional[datetime] = None
    class Config:
        orm_mode = True

# ─── SITE LOGS ──────────────────────────────────────────────────────────────
class SiteLogCreate(BaseModel):
    project_id: int
    concrete_slump_value: Optional[float] = Field(None, description="Concrete slump telemetry (in mm)")
    steel_reinforcement_mesh_ok: bool = False
    formwork_approved: bool = False
    curing_temperature_celsius: Optional[float] = None
    notes: Optional[str] = None

class SiteLogOut(BaseModel):
    id: int
    project_id: int
    logged_by_id: str
    concrete_slump_value: Optional[float]
    steel_reinforcement_mesh_ok: bool
    formwork_approved: bool
    curing_temperature_celsius: Optional[float]
    notes: Optional[str]
    status: SiteLogStatus
    created_at: datetime
    class Config:
        orm_mode = True

# ─── PREDICTIVE DELAY METRICS ───────────────────────────────────────────────
class PredictiveDelayMetricBase(BaseModel):
    project_id: int
    site_log_id: int
    predicted_variance_days: float
    confidence_score: float
    critical_path_impact: Optional[str] = None

class PredictiveDelayMetricOut(PredictiveDelayMetricBase):
    id: int
    created_at: datetime
    class Config:
        orm_mode = True

# ─── CLIENT UPDATES ──────────────────────────────────────────────────────────
class ClientUpdateBase(BaseModel):
    delay_metric_id: int
    conversational_text: str
    tone: str = "empathetic"

class ClientUpdateOut(ClientUpdateBase):
    id: int
    sent_at: datetime
    class Config:
        orm_mode = True

# ─── INVOICES ───────────────────────────────────────────────────────────────
class InvoiceBase(BaseModel):
    milestone_id: int
    invoice_number: str
    amount: float

class InvoiceOut(InvoiceBase):
    id: int
    generated_at: datetime
    is_dispatched: bool
    class Config:
        orm_mode = True

# ─── EVENT SYSTEM PAYLOADS ──────────────────────────────────────────────────
class SiteLogSubmittedEvent(BaseModel):
    event_id: str
    timestamp: datetime
    site_log_id: int
    project_id: int
    logged_by_id: str
