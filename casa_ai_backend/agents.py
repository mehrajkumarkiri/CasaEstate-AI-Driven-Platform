import random
import logging
from typing import Dict, Any, Optional
from database import SiteLog, Project, Milestone, PredictiveDelayMetric, ClientUpdate, Invoice

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("CasaAIAgents")

class PredictiveAnalyticsAgent:
    """
    Agent 1 (Predictive Analytics Agent - Theme 7)
    Triggered by a Site Log. Analyzes progress parameters, compares metrics against the target schedule,
    and runs regression modeling to predict timeline variances.
    """
    def __init__(self, db_session):
      self.db = db_session

    async def execute(self, site_log_id: int) -> Dict[str, Any]:
        logger.info(f"[Agent 1: Predictive Analytics] Starting analysis on SiteLog #{site_log_id}")
        
        # 1. Fetch site log metadata
        site_log = self.db.query(SiteLog).filter(SiteLog.id == site_log_id).first()
        if not site_log:
            raise ValueError(f"SiteLog with ID {site_log_id} not found")

        # 2. Mock ML/regression calculation based on telemetry feeds
        # E.g. Concrete slump (target is 100mm, deviation increases delay risk)
        # temperature (extreme heats impact curing logs)
        base_variance = 0.0
        confidence = 0.95

        if site_log.concrete_slump_value and (site_log.concrete_slump_value < 80 or site_log.concrete_slump_value > 120):
            base_variance += 1.5  # Potential delayed curing/slump correction
            confidence = 0.88
        
        if site_log.curing_temperature_celsius and site_log.curing_temperature_celsius > 35:
            base_variance += 0.8  # Heat cracks risk requires slower cure cycles
            confidence = 0.90
            
        if not site_log.steel_reinforcement_mesh_ok or not site_log.formwork_approved:
            base_variance += 3.5  # Re-laying steel mesh blocks casting pipeline
            confidence = 0.85

        # If everything is solid, progress is running slightly ahead of schedule
        if base_variance == 0.0:
            base_variance = -1.0  # 1 day ahead of schedule
            confidence = 0.98

        # 3. Assess critical path milestones impact
        active_milestones = self.db.query(Milestone).filter(
            Milestone.project_id == site_log.project_id,
            Milestone.status == "in_progress"
        ).all()
        
        impact_summary = f"Concrete telemetry indicates a predicted deviation of {base_variance:+.1f} days. "
        if active_milestones:
            impact_summary += f"Affecting critical milestone path: {', '.join([m.title for m in active_milestones])}."
        else:
            impact_summary += "No critical path milestones currently saturated."

        # 4. Save results to the database
        metric = PredictiveDelayMetric(
            project_id=site_log.project_id,
            site_log_id=site_log_id,
            predicted_variance_days=base_variance,
            confidence_score=confidence,
            critical_path_impact=impact_summary
        )
        self.db.add(metric)
        self.db.commit()
        self.db.refresh(metric)

        logger.info(f"[Agent 1 SUCCESS] Created PredictiveDelayMetric #{metric.id} with variance: {metric.predicted_variance_days:+.1f} days")
        return {
            "metric_id": metric.id,
            "predicted_variance_days": metric.predicted_variance_days,
            "confidence_score": metric.confidence_score,
            "critical_path_impact": metric.critical_path_impact
        }


class ClientCommunicationsAgent:
    """
    Agent 2 (Client Communications Agent - Theme 8)
    Consumes output from Agent 1. Translates structural metrics into an empathetic,
    conversational update for the client dashboard using LLM synthesis templates.
    """
    def __init__(self, db_session):
        self.db = db_session

    async def execute(self, delay_metric_id: int) -> Dict[str, Any]:
        logger.info(f"[Agent 2: Client Communications] Synthesizing narrative for Metric #{delay_metric_id}")

        # 1. Load context
        metric = self.db.query(PredictiveDelayMetric).filter(PredictiveDelayMetric.id == delay_metric_id).first()
        if not metric:
            raise ValueError(f"PredictiveDelayMetric with ID {delay_metric_id} not found")

        project = self.db.query(Project).filter(Project.id == metric.project_id).first()
        site_log = self.db.query(SiteLog).filter(SiteLog.id == metric.site_log_id).first()

        # 2. Call LLM (Gemini / OpenAI placeholder template)
        # In a real environment, you would invoke `google.generativeai.GenerativeModel.generate_content`
        # here using variables from project, site_log, and metric.
        prompt = (
            f"You are the CasaEstate Client Communications Representative. "
            f"Write an empathetic update for the residents of {project.name}. "
            f"Project variance: {metric.predicted_variance_days:+.1f} days. "
            f"Steel approved: {site_log.steel_reinforcement_mesh_ok}. "
            f"Formwork approved: {site_log.formwork_approved}. "
            f"Keep it conversational, jargon-free, and focus on safety first."
        )
        
        # Simulated LLM empathetic narrative synthesis:
        if metric.predicted_variance_days <= 0:
            narrative = (
                f"We are excited to share a fresh update from the Noida Tower A site! Our engineering team has "
                f"successfully completed the reinforced steel audits. Real-time telemetry verifies the structure "
                f"is in perfect compliance. We are currently pacing 1 day ahead of schedule, heading smoothly toward "
                f"our target completion timeline. Thank you for your continued trust in CasaEstate."
            )
        else:
            narrative = (
                f"An update from your future home at Noida Tower A: During our routine concrete pour tests, our "
                f"AI systems identified a minor moisture fluctuation. For your absolute safety, our engineers are "
                f"conducting extended curing cycles. This high-standard safety verification adds a slight adjustment "
                f"of {metric.predicted_variance_days} days to the slab schedule. We appreciate your understanding as "
                f"we prioritize structural excellence."
            )

        # 3. Persist update
        client_update = ClientUpdate(
            delay_metric_id=delay_metric_id,
            conversational_text=narrative,
            tone="empathetic"
        )
        self.db.add(client_update)
        self.db.commit()
        self.db.refresh(client_update)

        logger.info(f"[Agent 2 SUCCESS] Created ClientUpdate #{client_update.id}")
        return {
            "update_id": client_update.id,
            "conversational_text": client_update.conversational_text,
            "tone": client_update.tone
        }


class FinancialInvoiceAgent:
    """
    Agent 3 (Financial Automation Agent)
    Checks if the current milestones triggered by progress have entered a billing stage.
    Generates PDF/digital invoices automatically to trigger billing events.
    """
    def __init__(self, db_session):
        self.db = db_session

    async def execute(self, project_id: int) -> Optional[Dict[str, Any]]:
        logger.info(f"[Agent 3: Financial Automation] Reviewing milestone billing status for Project #{project_id}")

        # 1. Find completed milestones that have billing triggers but no generated invoices
        billing_milestones = self.db.query(Milestone).filter(
            Milestone.project_id == project_id,
            Milestone.status == "completed",
            Milestone.billing_trigger_stage == True
        ).all()

        invoices_created = []

        for milestone in billing_milestones:
            # Check if invoice already exists
            existing = self.db.query(Invoice).filter(Invoice.milestone_id == milestone.id).first()
            if existing:
                continue

            # 2. Programmatically generate invoice
            invoice_num = f"INV-CASA-{milestone.id}-{random.randint(1000, 9999)}"
            invoice = Invoice(
                milestone_id=milestone.id,
                invoice_number=invoice_num,
                amount=milestone.billing_amount,
                is_dispatched=True
            )
            self.db.add(invoice)
            self.db.commit()
            self.db.refresh(invoice)

            logger.info(f"[Agent 3 SUCCESS] Programmatically generated Invoice #{invoice.id} ({invoice.invoice_number}) for ₹{invoice.amount}")
            invoices_created.append({
                "invoice_id": invoice.id,
                "invoice_number": invoice.invoice_number,
                "amount": invoice.amount,
                "milestone_title": milestone.title
            })

        return invoices_created if invoices_created else None
