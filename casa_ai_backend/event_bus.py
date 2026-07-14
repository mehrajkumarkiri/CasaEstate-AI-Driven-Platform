import asyncio
import logging
from datetime import datetime
from typing import Callable, Dict, List, Any
from database import SessionLocal
from agents import PredictiveAnalyticsAgent, ClientCommunicationsAgent, FinancialInvoiceAgent
from schemas import SiteLogSubmittedEvent

logger = logging.getLogger("CasaAIEventBus")

class AsyncEventBus:
    """
    In-memory async event broker.
    Supports subscribing listeners to specific event channels and firing payloads asynchronously.
    """
    def __init__(self):
        self._listeners: Dict[str, List[Callable]] = {}

    def subscribe(self, event_type: str, listener: Callable):
        if event_type not in self._listeners:
            self._listeners[event_type] = []
        self._listeners[event_type].append(listener)
        logger.info(f"Subscribed listener {listener.__name__} to event: '{event_type}'")

    async def publish(self, event_type: str, payload: Any):
        logger.info(f"⚡ Publishing event '{event_type}' with payload: {payload}")
        if event_type not in self._listeners:
            logger.warning(f"No registered listeners for event: '{event_type}'")
            return

        # Fire off listeners concurrently
        tasks = [listener(payload) for listener in self._listeners[event_type]]
        await asyncio.gather(*tasks)


# Instantiate the global event bus
event_bus = AsyncEventBus()

# ─── CONCRETE EVENT HANDLER ──────────────────────────────────────────────────

async def handle_site_log_submitted(event: SiteLogSubmittedEvent):
    """
    Intelligent Swarm Orchestrator:
    Listens for 'SiteLogSubmitted', then sequentially executes the multi-flow agent chain:
    1. Agent 1 (PredictiveAnalyticsAgent): Predicts schedules and delays.
    2. Agent 2 (ClientCommunicationsAgent): Drafts conversational client narrative.
    3. Agent 3 (FinancialInvoiceAgent): Auto-generates billing invoices for milestone stages.
    """
    logger.info(f"🔔 [Swarm Orchestrator] Intercepted 'SiteLogSubmitted' for Log #{event.site_log_id}")
    
    db = SessionLocal()
    try:
        # 1. Execute Agent 1: Predictive Schedule & Delay Risk Modeling
        analytics_agent = PredictiveAnalyticsAgent(db)
        analytics_result = await analytics_agent.execute(site_log_id=event.site_log_id)
        metric_id = analytics_result["metric_id"]

        # 2. Execute Agent 2: Conversational LLM Client Translator
        comm_agent = ClientCommunicationsAgent(db)
        comm_result = await comm_agent.execute(delay_metric_id=metric_id)

        # 3. Execute Agent 3: Financial Automation check
        finance_agent = FinancialInvoiceAgent(db)
        invoices_result = await finance_agent.execute(project_id=event.project_id)

        logger.info("🎉 [Orchestrator SUCCESS] Completed Agent Swarm pipeline execution:")
        logger.info(f"   ↳ Delay Model: {analytics_result['predicted_variance_days']:+.1f} days variance")
        logger.info(f"   ↳ Narrative: '{comm_result['conversational_text'][:60]}...'")
        if invoices_result:
            logger.info(f"   ↳ Financial: Generated {len(invoices_result)} invoice(s)")
        else:
            logger.info("   ↳ Financial: No milestones met invoice billing stages")

    except Exception as e:
        logger.error(f"❌ [Orchestrator ERROR] Agent Swarm pipeline failed: {str(e)}", exc_info=True)
    finally:
        db.close()


# Register orchestrator to event channel
event_bus.subscribe("SiteLogSubmitted", handle_site_log_submitted)
