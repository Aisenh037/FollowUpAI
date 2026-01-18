"""Lead discovery routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from services.database import get_db
from models.user import User
from models.lead import Lead
from routes.auth import get_current_user
from agents.workflow import agent_executors
from agents.email_generator import email_generator
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/discovery", tags=["Discovery"])

@router.post("/run")
async def run_discovery(
    query: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run autonomous lead discovery.
    1. Search for potential leads based on query.
    2. Parse results into structured lead data.
    3. Return results (user chooses what to add).
    """
    try:
        # Run LangGraph Discovery Workflow
        initial_state = {
            "lead": None,
            "days_since_contact": 0,
            "status": "new",
            "email_body": "",
            "email_subject": "",
            "action_taken": "started_discovery",
            "discovery_results": [],
            "search_query": query
        }
        
        final_state = await agent_executors.discover.ainvoke(initial_state)
        
        # Parse results using LLM
        raw_results = final_state.get("discovery_results", [])
        parsed_leads = email_generator.parse_search_results(raw_results, query)
        
        return {
            "success": True,
            "query": query,
            "results_count": len(parsed_leads),
            "leads": parsed_leads
        }
        
    except Exception as e:
        logger.error(f"Discovery failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Discovery failed: {str(e)}"
        )

@router.post("/add-batch")
async def add_discovered_leads(
    leads: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a batch of discovered leads to the database."""
    added_count = 0
    for lead_data in leads:
        try:
            new_lead = Lead(
                user_id=current_user.id,
                name=lead_data.get("name"),
                email=lead_data.get("email", "unknown@domain.com"),
                company=lead_data.get("company"),
                contact_type=lead_data.get("contact_type", "client"),
                source_url=lead_data.get("source_url"),
                status="active"
            )
            db.add(new_lead)
            added_count += 1
        except Exception as e:
            logger.error(f"Failed to add lead {lead_data.get('name')}: {e}")
            
    db.commit()
    return {"success": True, "added_count": added_count}
