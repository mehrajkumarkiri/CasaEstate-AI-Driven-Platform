import enum
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker

DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/casaestate_ai"
Base = declarative_base()

class MilestoneStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"

class SiteLogStatus(str, enum.Enum):
    SUBMITTED = "submitted"
    VERIFIED = "verified"
    REJECTED = "rejected"

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location = Column(String(500), nullable=False)
    rera_registration_number = Column(String(100), unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    milestones = relationship("Milestone", back_populates="project", cascade="all, delete-orphan")
    site_logs = relationship("SiteLog", back_populates="project", cascade="all, delete-orphan")
    delay_metrics = relationship("PredictiveDelayMetric", back_populates="project", cascade="all, delete-orphan")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_date = Column(DateTime, nullable=False)
    actual_completion_date = Column(DateTime, nullable=True)
    status = Column(Enum(MilestoneStatus), default=MilestoneStatus.PENDING, nullable=False)
    billing_trigger_stage = Column(Boolean, default=False, nullable=False)  # If True, triggers Invoice generation upon completion
    billing_amount = Column(Float, default=0.0)

    # Relationships
    project = relationship("Project", back_populates="milestones")
    invoices = relationship("Invoice", back_populates="milestone")

class SiteLog(Base):
    __tablename__ = "site_logs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    logged_by_id = Column(String(100), nullable=False)  # Site Engineer User ID
    concrete_slump_value = Column(Float, nullable=True)  # Telemetry data
    steel_reinforcement_mesh_ok = Column(Boolean, default=False)
    formwork_approved = Column(Boolean, default=False)
    curing_temperature_celsius = Column(Float, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(Enum(SiteLogStatus), default=SiteLogStatus.SUBMITTED, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="site_logs")
    delay_metrics = relationship("PredictiveDelayMetric", back_populates="site_log")

class PredictiveDelayMetric(Base):
    __tablename__ = "predictive_delay_metrics"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    site_log_id = Column(Integer, ForeignKey("site_logs.id", ondelete="CASCADE"), nullable=False)
    predicted_variance_days = Column(Float, nullable=False)  # e.g., +2.5 days (delay) or -1.0 (ahead)
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0 representing AI confidence
    critical_path_impact = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="delay_metrics")
    site_log = relationship("SiteLog", back_populates="delay_metrics")
    client_updates = relationship("ClientUpdate", back_populates="delay_metric")

class ClientUpdate(Base):
    __tablename__ = "client_updates"

    id = Column(Integer, primary_key=True, index=True)
    delay_metric_id = Column(Integer, ForeignKey("predictive_delay_metrics.id", ondelete="CASCADE"), nullable=False)
    conversational_text = Column(Text, nullable=False)  # LLM synthesized client-friendly text
    tone = Column(String(50), default="empathetic")
    sent_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    delay_metric = relationship("PredictiveDelayMetric", back_populates="client_updates")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    milestone_id = Column(Integer, ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False)
    invoice_number = Column(String(100), unique=True, nullable=False, index=True)
    amount = Column(Float, nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow)
    is_dispatched = Column(Boolean, default=False)

    # Relationships
    milestone = relationship("Milestone", back_populates="invoices")

# DB Engine & Session Factory setup helper
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
      yield db
    finally:
      db.close()
