"""Main agent orchestration and execution with Industry-Grade standards."""
from sqlalchemy.orm import Session
from models.lead import Lead
from models.activity_log import ActivityLog
from agents.lead_classifier import lead_classifier
from agents.email_generator import email_generator
from services.communication_service import comm_service
from typing import List, Dict, Optional
from datetime import datetime, timezone
from loguru import logger
from config import get_settings

settings = get_settings()

class AgentRunner:
    """Main agent that orchestrates lead analysis and multi-channel outreach."""
    
    def __init__(self, db: Session, user_id: int):
        self.db = db
        self.user_id = user_id
        self.activities: List[Dict] = []
        
        # PRO-TIP: Centralized logging setup
        logger.bind(user_id=user_id)
    
    def run(self) -> Dict:
        """Run the autonomous agent for all leads in the pipeline."""
        logger.info(f"System: Initiating global cycle for user {self.user_id}")
        
        leads = self.db.query(Lead).filter(Lead.user_id == self.user_id).all()
        
        if not leads:
            return {
                "success": True,
                "leads_processed": 0,
                "actions_taken": 0,
                "activities": [],
                "message": "No prospects found in system"
            }
        
        actions_taken = 0
        for lead in leads:
            try:
                result = self.run_for_lead(lead.id)
                if result.get("action_performed"):
                    actions_taken += 1
            except Exception as e:
                logger.error(f"Critical fail for lead {lead.id}: {e}")
                
        return {
            "success": True,
            "leads_processed": len(leads),
            "actions_taken": actions_taken,
            "activities": self.activities,
            "message": f"Cycle complete. {actions_taken} actions performed across {len(leads)} leads."
        }

    def run_for_lead(self, lead_id: int, force_context: Optional[str] = None) -> Dict:
        """Execute the AI workflow for a specific prospect."""
        from agents.workflow import agent_executors
        
        lead = self.db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == self.user_id).first()
        if not lead:
            return {"success": False, "error": "Prospect not identified"}

        try:
            # 1. State Initialization
            initial_state = {
                "lead": lead,
                "days_since_contact": 0,
                "status": lead.status,
                "email_body": "",
                "email_subject": "",
                "action_taken": "analyzing",
                "discovery_results": []
            }
            
            # 2. Strategic Execution (LangGraph)
            if force_context:
                email_body = email_generator.generate_email(lead, context_type=force_context)
                subject = f"Connecting - {lead.name}" if force_context == "cold_mail" else f"Re: {lead.company} - {lead.name}"
                final_state = {**initial_state, "email_body": email_body, "email_subject": subject, "action_taken": force_context}
            else:
                final_state = agent_executors.run.invoke(initial_state)

            # 3. Status Synchronization
            if lead.status != final_state["status"]:
                lead.status = final_state["status"]
                self._log_activity(
                    lead_id=lead.id,
                    action_type="classified",
                    details={
                        "new_status": final_state["status"],
                        "category": final_state["status"]
                    }
                )
            
            action_performed = False
            
            # 4. Multi-Channel Dispatch
            if final_state["email_body"]:
                # PRO-TIP: Use the unified comm_service for all outreach
                email_result = comm_service.send_email(
                    to_email=lead.email,
                    subject=final_state["email_subject"],
                    html_content=f"<div style='font-family: sans-serif;'>{final_state['email_body'].replace(chr(10), '<br>')}</div>"
                )
                
                if email_result["success"]:
                    action_performed = True
                    lead.last_contacted_date = datetime.now(timezone.utc)
                    self._log_activity(
                        lead_id=lead.id,
                        action_type="sent_email",
                        details={
                            "subject": final_state["email_subject"],
                            "email_id": email_result.get("id"),
                            "lead_name": lead.name
                        }
                    )
                else:
                    self._log_activity(
                        lead_id=lead.id,
                        action_type="error",
                        details={"error": email_result.get("error")}
                    )
            
            self.db.commit()
            return {"success": True, "action_performed": action_performed}
                        
        except Exception as e:
            logger.error(f"Strategic failure for prospect {lead_id}: {e}")
            self._log_activity(
                lead_id=lead_id,
                action_type="error",
                details={"error_message": str(e)}
            )
            self.db.rollback()
            return {"success": False, "error": str(e)}

    def run_whatsapp_action(self, lead_id: int, template_name: str) -> Dict:
        """Execute an automated WhatsApp outreach."""
        lead = self.db.query(Lead).filter(Lead.id == lead_id, Lead.user_id == self.user_id).first()
        if not lead or not lead.phone:
            return {"success": False, "error": "Contact info missing (Phone required for WhatsApp)"}

        try:
            # Generate personalized message
            message = email_generator.generate_email(lead, context_type=template_name)
            
            # Send via Twilio
            result = comm_service.send_whatsapp(to_phone=lead.phone, message=message)
            
            if result["success"]:
                lead.last_contacted_date = datetime.now(timezone.utc)
                self._log_activity(
                    lead_id=lead.id,
                    action_type="custom_email_sent", # Using this type for activity log consistency or create 'whatsapp_sent'
                    details={
                        "channel": "WhatsApp",
                        "content_preview": message[:50] + "...",
                        "sid": result.get("sid")
                    }
                )
                self.db.commit()
                return {"success": True}
            else:
                return {"success": False, "error": result.get("error")}

        except Exception as e:
            logger.error(f"WhatsApp execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    def _log_activity(self, lead_id: int, action_type: str, details: Dict):
        """Standardized activity logging into database and memory."""
        lead = self.db.query(Lead).filter(Lead.id == lead_id).first()
        if lead and "lead_name" not in details:
            details["lead_name"] = lead.name

        activity_log = ActivityLog(
            user_id=self.user_id,
            lead_id=lead_id,
            action_type=action_type,
            details=details
        )
        self.db.add(activity_log)
        
        self.activities.append({
            "lead_id": lead_id,
            "action_type": action_type,
            "details": details
        })
