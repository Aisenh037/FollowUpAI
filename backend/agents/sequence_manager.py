from sqlalchemy.orm import Session
from models.lead import Lead
from models.sequence import Sequence, SequenceStep
from datetime import datetime, timedelta, timezone
from agents.agent_runner import AgentRunner
from loguru import logger

class SequenceManager:
    """Orchestrates the progression of multi-step automation protocols."""
    
    def __init__(self, db: Session):
        self.db = db

    def advance_sequences(self):
        """Standard Industry Pattern: Cron-friendly sequence stepper."""
        logger.info("Sequence Engine: Scanning for leads ready for next stage...")
        
        # Get all leads currently active in a sequence
        leads = self.db.query(Lead).filter(Lead.sequence_id.isnot(None)).all()
        
        for lead in leads:
            try:
                self._process_lead_sequence(lead)
            except Exception as e:
                logger.error(f"Engine failure for lead {lead.id}: {e}")
        
        self.db.commit()

    def _process_lead_sequence(self, lead: Lead):
        """Determines if a lead is ready for the next action in their protocol."""
        
        # Fetch the next step in the assigned protocol
        next_step_number = lead.current_step_number + 1
        next_step = self.db.query(SequenceStep).filter(
            SequenceStep.sequence_id == lead.sequence_id,
            SequenceStep.step_number == next_step_number
        ).first()

        if not next_step:
            # End of the road for this sequence
            return

        # Time Check: Industry standard delay logic
        if lead.last_contacted_date:
            wait_until = lead.last_contacted_date + timedelta(days=next_step.wait_days)
            if datetime.now(timezone.utc) < wait_until:
                return # Still in the waiting period

        # ACTION TRIGGER
        logger.info(f"Signal: Triggering Stage {next_step_number} ({next_step.action_type}) for prospect {lead.id}")
        
        agent = AgentRunner(db=self.db, user_id=lead.user_id)
        result = {"success": False}

        if next_step.action_type == 'email':
            # Dispatch follow-up email
            result = agent.run_for_lead(lead_id=lead.id, force_context=next_step.template_name)
        
        elif next_step.action_type == 'whatsapp':
            # Dispatch automated WhatsApp
            result = agent.run_whatsapp_action(lead_id=lead.id, template_name=next_step.template_name)

        if result.get("success"):
            # Progress the lead to the next stage
            lead.current_step_number = next_step_number
            logger.info(f"Sync: Lead {lead.id} successfully transitioned to Stage {next_step_number}")
