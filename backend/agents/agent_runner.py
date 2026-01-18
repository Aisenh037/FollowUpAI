"""Main agent orchestration and execution."""
from sqlalchemy.orm import Session
from models.lead import Lead
from models.activity_log import ActivityLog
from agents.lead_classifier import lead_classifier
from agents.email_generator import email_generator
from services.email_service import email_service
from typing import List, Dict
from datetime import datetime, timezone
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AgentRunner:
    """Main agent that orchestrates lead analysis and email sending."""
    
    def __init__(self, db: Session, user_id: int):
        """
        Initialize agent runner.
        
        Args:
            db: Database session
            user_id: ID of the user whose leads to process
        """
        self.db = db
        self.user_id = user_id
        self.activities: List[Dict] = []
    
    def run(self) -> Dict:
        """
        Run the autonomous agent for all leads.
        """
        logger.info(f"Starting global agent run for user {self.user_id}")
        
        # Fetch all leads
        leads = self.db.query(Lead).filter(Lead.user_id == self.user_id).all()
        
        if not leads:
            return {
                "success": True,
                "leads_processed": 0,
                "emails_sent": 0,
                "activities": [],
                "message": "No leads to process"
            }
        
        emails_sent = 0
        for lead in leads:
            result = self.run_for_lead(lead.id)
            if result.get("email_sent"):
                emails_sent += 1
        
        return {
            "success": True,
            "leads_processed": len(leads),
            "emails_sent": emails_sent,
            "activities": self.activities,
            "message": f"Processed {len(leads)} leads, sent {emails_sent} emails"
        }

    def run_for_lead(self, lead_id: int, force_context: str | None = None) -> Dict:
        """
        Run agent workflow for a specific lead.
        """
        from agents.workflow import agent_executors
        
        lead = self.db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == self.user_id).first()
        if not lead:
            return {"success": False, "error": "Lead not found"}

        try:
            # Initialize Graph State
            initial_state = {
                "lead": lead,
                "days_since_contact": 0,
                "status": lead.status,
                "email_body": "",
                "email_subject": "",
                "action_taken": "started",
                "discovery_results": []
            }
            
            # Execute LangGraph Workflow
            # If force_context is provided, we can skip classification or override 
            # In this simple implementation, if force_context is 'cold_mail', 
            # we manually generate the email instead of running the whole graph nodes 
            # OR we can inject the intent into the graph. For now, let's keep it direct.
            
            if force_context:
                email_body = email_generator.generate_email(lead, context_type=force_context)
                subject = f"Connecting - {lead.name}" if force_context == "cold_mail" else f"Re: {lead.company} - {lead.name}"
                final_state = {**initial_state, "email_body": email_body, "email_subject": subject, "action_taken": force_context}
            else:
                final_state = agent_executors.run.invoke(initial_state)

            # Update Lead Status if it changed
            if lead.status != final_state["status"]:
                lead.status = final_state["status"]
                
                self._log_activity(
                    lead_id=lead.id,
                    action_type="classified",
                    details={
                        "new_status": final_state["status"],
                        "days_since_contact": final_state.get("days_since_contact", 0)
                    }
                )
            
            email_sent = False
            # Handle Email Sending
            if final_state["email_body"]:
                email_result = email_service.send_email(
                    to_email=lead.email,
                    subject=final_state["email_subject"],
                    html_content=f"<p>{final_state['email_body'].replace(chr(10), '<br>')}</p>"
                )
                
                if email_result["success"]:
                    email_sent = True
                    # Update contact date
                    lead.last_contacted_date = datetime.now(timezone.utc)
                    
                    self._log_activity(
                        lead_id=lead.id,
                        action_type="sent_email",
                        details={
                            "mode": "Placement" if lead.contact_type in ["recruiter", "hr"] else "Freelance",
                            "context": force_context or "followup",
                            "subject": final_state["email_subject"],
                            "email_id": email_result.get("email_id")
                        }
                    )
                else:
                    self._log_activity(
                        lead_id=lead.id,
                        action_type="error",
                        details={"error": email_result.get("error")}
                    )
            
            self.db.commit()
            return {"success": True, "email_sent": email_sent}
                        
        except Exception as e:
            logger.error(f"Error processing lead {lead_id}: {str(e)}")
            self._log_activity(
                lead_id=lead.id,
                action_type="error",
                details={"error_message": str(e)}
            )
            self.db.rollback() # Rollback any changes for this lead if an error occurs
            return {"success": False, "error": str(e)}
    
    def _log_activity(self, lead_id: int, action_type: str, details: Dict):
        """Log an activity to database and memory."""
        activity_log = ActivityLog(
            user_id=self.user_id,
            lead_id=lead_id,
            action_type=action_type,
            details=details
        )
        self.db.add(activity_log)
        # We don't commit here, we commit in the main transaction
        
        # Add to in-memory list for response
        self.activities.append({
            "lead_id": lead_id,
            "action_type": action_type,
            "details": details
        })
