from sqlalchemy.orm import Session
from models.lead import Lead
from models.sequence import Sequence, SequenceStep
from datetime import datetime, timedelta, timezone
from agents.agent_runner import AgentRunner
from loguru import logger

class SequenceManager:
    def __init__(self, db: Session):
        self.db = db

    def advance_sequences(self):
        """Find leads ready for the next sequence step and process them."""
        # Get all leads currently in a sequence
        leads = self.db.query(Lead).filter(Lead.sequence_id.isnot(None)).all()
        
        for lead in leads:
            try:
                self._process_lead_sequence(lead)
            except Exception as e:
                logger.error(f"Error processing sequence for lead {lead.id}: {str(e)}")
        
        self.db.commit()

    def _process_lead_sequence(self, lead: Lead):
        # Fetch the next step
        next_step_number = lead.current_step_number + 1
        next_step = self.db.query(SequenceStep).filter(
            SequenceStep.sequence_id == lead.sequence_id,
            SequenceStep.step_number == next_step_number
        ).first()

        if not next_step:
            logger.info(f"Lead {lead.id} has completed all steps in sequence {lead.sequence_id}")
            return

        # Check wait time
        if lead.last_contacted_date:
            wait_until = lead.last_contacted_date + timedelta(days=next_step.wait_days)
            if datetime.now(timezone.utc) < wait_until:
                return # Not time yet

        # It's time! Trigger the action
        logger.info(f"Triggering step {next_step_number} ({next_step.action_type}) for lead {lead.id}")
        
        agent = AgentRunner(db=self.db, user_id=lead.user_id)
        
        if next_step.action_type == 'email':
            # Run agent for lead with the specified template/context
            result = agent.run_for_lead(lead_id=lead.id, force_context=next_step.template_name)
            if result.get("success"):
                lead.current_step_number = next_step_number
                # Lead contact date is updated inside run_for_lead
                logger.info(f"Step {next_step_number} successful for lead {lead.id}")
        else:
            logger.warning(f"Action type {next_step.action_type} not yet implemented for autonomous sequences")
