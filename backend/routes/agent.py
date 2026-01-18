"""Agent control routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from pydantic import BaseModel
from typing import List
from schemas.agent import AgentRunResponse, ActivityLogResponse
from services.database import get_db
from models.user import User
from models.lead import Lead
from models.activity_log import ActivityLog
from routes.auth import get_current_user
from agents.agent_runner import AgentRunner
from worker import run_agent_task, run_lead_task

router = APIRouter(prefix="/api/agent", tags=["Agent"])


@router.post("/run", response_model=AgentRunResponse)
def run_agent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run the AI agent to process leads.
    
    The agent will:
    1. Classify all leads
    2. Generate follow-up emails for stalled/needs_followup leads
    3. Send emails
    4. Log all activities
    """
    try:
        # result = agent.run() # OLD SYNC WAY
        run_agent_task.kiq(current_user.id)
        return {
            "success": True,
            "leads_processed": 0,
            "emails_sent": 0,
            "message": "Global agent run started in background."
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent execution failed: {str(e)}"
        )


@router.post("/run-lead/{lead_id}", response_model=AgentRunResponse)
def run_lead_action(
    lead_id: int,
    context_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run the AI agent for a specific lead.
    """
    try:
        # agent = AgentRunner(db=db, user_id=current_user.id)
        # result = agent.run_for_lead(lead_id=lead_id, force_context=context_type)
        run_lead_task.kiq(user_id=current_user.id, lead_id=lead_id, context_type=context_type)
        
        return {
            "success": True,
            "leads_processed": 1,
            "emails_sent": 0,
            "activities": [],
            "message": "Lead processing started in background."
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Agent execution failed: {str(e)}"
        )


class CustomEmailRequest(BaseModel):
    lead_id: int
    subject: str
    body: str

@router.post("/send-custom-email")
def send_custom_email(
    request: CustomEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a manual custom email to a lead.
    """
    lead = db.query(Lead).filter(Lead.id == request.lead_id, Lead.user_id == current_user.id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    try:
        # Update lead's last contacted date
        lead.last_contacted_date = datetime.now()
        
        # Log the activity
        from models.activity_log import ActivityLog
        activity = ActivityLog(
            user_id=current_user.id,
            lead_id=lead.id,
            action_type="custom_email_sent",
            details={
                "subject": request.subject,
                "body_snippet": request.body[:100] + "..."
            }
        )
        db.add(activity)
        db.commit()
        
        return {"success": True, "message": "Custom email sent and logged"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/activities", response_model=List[ActivityLogResponse])
def get_activities(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get recent agent activities."""
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id
    ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    
    return activities


@router.get("/stats")
def get_agent_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get agent statistics."""
    from sqlalchemy import func
    from datetime import timedelta
    
    # Count leads by status
    status_counts = db.query(
        Lead.status,
        func.count(Lead.id).label('count')
    ).filter(
        Lead.user_id == current_user.id
    ).group_by(Lead.status).all()
    
    stats = {
        "total_leads": 0,
        "active": 0,
        "needs_followup": 0,
        "stalled": 0,
        "career_leads": 0,
        "freelance_leads": 0
    }
    
    for status, count in status_counts:
        stats["total_leads"] += count
        stats[status] = count

    # Count by contact type
    type_counts = db.query(
        Lead.contact_type,
        func.count(Lead.id).label('count')
    ).filter(
        Lead.user_id == current_user.id
    ).group_by(Lead.contact_type).all()

    for c_type, count in type_counts:
        if c_type in ["recruiter", "hr"]:
            stats["career_leads"] += count
        else:
            stats["freelance_leads"] += count
    
    # Count emails sent today
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    emails_today = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user.id,
        ActivityLog.action_type == "sent_email",
        ActivityLog.created_at >= today
    ).count()
    
    stats["emails_sent_today"] = emails_today
    
    return stats
