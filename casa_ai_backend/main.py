import uuid
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, BackgroundTasks, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from database import Base, engine, get_db, Project, Milestone, SiteLog, PredictiveDelayMetric, ClientUpdate, Invoice, MilestoneStatus
from schemas import SiteLogCreate, SiteLogOut, ProjectOut, MilestoneOut, PredictiveDelayMetricOut, ClientUpdateOut, InvoiceOut, SiteLogSubmittedEvent
from event_bus import event_bus

# Initialize database schemas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CasaEstate AI Backend Engine",
    description="Event-Driven Multi-Flow AI Agent Swarm for Real Estate & Construction Operations",
    version="1.0.0"
)

# ─── TELEMETRY INGESTION (TRIGGERS SWARM EVENT LOOP) ──────────────────────────

@app.post("/api/v1/site-logs", response_model=SiteLogOut, status_code=status.HTTP_201_CREATED)
async def submit_site_log(
    log_in: SiteLogCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Endpoint for Site Engineers to log telemetry feeds.
    Triggers the 'SiteLogSubmitted' event on the async event bus.
    """
    # Verify project exists
    project = db.query(Project).filter(Project.id == log_in.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # 1. Save Site Log record to Database
    new_log = SiteLog(
        project_id=log_in.project_id,
        logged_by_id="usr-eng-007",  # Hardcoded authenticated engineer context
        concrete_slump_value=log_in.concrete_slump_value,
        steel_reinforcement_mesh_ok=log_in.steel_reinforcement_mesh_ok,
        formwork_approved=log_in.formwork_approved,
        curing_temperature_celsius=log_in.curing_temperature_celsius,
        notes=log_in.notes
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # 2. Package event payload
    event = SiteLogSubmittedEvent(
        event_id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        site_log_id=new_log.id,
        project_id=new_log.project_id,
        logged_by_id=new_log.logged_by_id
    )

    # 3. Offload event bus execution loop to background task (maintains FastAPI responsiveness)
    background_tasks.add_task(event_bus.publish, "SiteLogSubmitted", event)

    return new_log


# ─── QUERY ENDPOINTS FOR AI GENERATED OUTPUTS ─────────────────────────────────

@app.get("/api/v1/projects/{project_id}/analytics", response_model=List[PredictiveDelayMetricOut])
def get_predictive_metrics(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all AI schedule deviation audits for a project.
    """
    metrics = db.query(PredictiveDelayMetric).filter(PredictiveDelayMetric.project_id == project_id).all()
    return metrics


@app.get("/api/v1/projects/{project_id}/client-updates", response_model=List[ClientUpdateOut])
def get_client_dashboard_updates(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieve empathetic conversational dashboard logs generated for clients.
    """
    updates = db.query(ClientUpdate).join(
        PredictiveDelayMetric, ClientUpdate.delay_metric_id == PredictiveDelayMetric.id
    ).filter(PredictiveDelayMetric.project_id == project_id).all()
    return updates


@app.get("/api/v1/projects/{project_id}/invoices", response_model=List[InvoiceOut])
def get_milestone_invoices(project_id: int, db: Session = Depends(get_db)):
    """
    Retrieve programmatically dispatched financial invoices.
    """
    invoices = db.query(Invoice).join(
        Milestone, Invoice.milestone_id == Milestone.id
    ).filter(Milestone.project_id == project_id).all()
    return invoices


# ─── SEED TESTING ENDPOINT ───────────────────────────────────────────────────

@app.post("/api/v1/seed", status_code=status.HTTP_201_CREATED)
def seed_sandbox_data(db: Session = Depends(get_db)):
    """
    Seed helper to populate mock projects and milestone triggers in your Postgres instance.
    """
    # 1. Create Mock Project
    project = db.query(Project).filter(Project.name == "Noida Elite Tower A").first()
    if not project:
        project = Project(
            name="Noida Elite Tower A",
            location="Sector 150, Noida, UP",
            rera_registration_number="UP-RERA-2026-REG-88209"
        )
        db.add(project)
        db.commit()
        db.refresh(project)

    # 2. Add Milestones
    # Milestone 1: Slab Casting (triggers billing stage invoice)
    m1 = db.query(Milestone).filter(Milestone.title == "Slab L4 Casting").first()
    if not m1:
        m1 = Milestone(
            project_id=project.id,
            title="Slab L4 Casting",
            description="Structural pouring of 4th level slab reinforcement",
            target_date=datetime(2026, 7, 30),
            status=MilestoneStatus.IN_PROGRESS,
            billing_trigger_stage=True,
            billing_amount=4500000.0  # ₹45 Lakhs billing milestone
        )
        db.add(m1)

    # Milestone 2: Foundation (already completed)
    m2 = db.query(Milestone).filter(Milestone.title == "Foundation Excavation").first()
    if not m2:
        m2 = Milestone(
            project_id=project.id,
            title="Foundation Excavation",
            description="Deep ground digging and retaining wall support completed",
            target_date=datetime(2026, 6, 1),
            actual_completion_date=datetime(2026, 5, 28),
            status=MilestoneStatus.COMPLETED,
            billing_trigger_stage=True,
            billing_amount=12000000.0
        )
        db.add(m2)

    db.commit()
    return {"message": "Sandbox database seeded successfully", "project_id": project.id}
