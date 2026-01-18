"""Lead management routes."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from schemas.lead import LeadCreate, LeadUpdate, LeadResponse
from services.database import get_db
from models.lead import Lead
from models.user import User
from routes.auth import get_current_user

from fastapi.responses import StreamingResponse
import csv
import io

router = APIRouter(prefix="/api/leads", tags=["Leads"])


@router.get("/export")
def export_leads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all leads to CSV."""
    leads = db.query(Lead).filter(Lead.user_id == current_user.id).all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "ID", "Name", "Email", "Company", "Status", 
        "Contact Type", "Last Contacted", "Last Message", 
        "Tech Stack", "Source URL", "Created At"
    ])
    
    for lead in leads:
        writer.writerow([
            lead.id,
            lead.name,
            lead.email,
            lead.company,
            lead.status,
            lead.contact_type,
            lead.last_contacted_date.isoformat() if lead.last_contacted_date else "Never",
            lead.last_message,
            lead.tech_stack,
            lead.source_url,
            lead.created_at.isoformat() if lead.created_at else ""
        ])
    
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
    )


@router.get("", response_model=List[LeadResponse])
def get_leads(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all leads for current user."""
    leads = db.query(Lead).filter(Lead.user_id == current_user.id).all()
    return leads


@router.post("", response_model=LeadResponse, status_code=status.HTTP_201_CREATED)
def create_lead(
    lead_data: LeadCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new lead."""
    new_lead = Lead(
        user_id=current_user.id,
        name=lead_data.name,
        email=lead_data.email,
        company=lead_data.company,
        last_contacted_date=lead_data.last_contacted_date,
        last_message=lead_data.last_message,
        status="active",
        contact_type=lead_data.contact_type,
        resume_link=lead_data.resume_link,
        tech_stack=lead_data.tech_stack,
        source_url=lead_data.source_url
    )
    db.add(new_lead)
    db.commit()
    db.refresh(new_lead)
    return new_lead


@router.get("/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific lead."""
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.user_id == current_user.id
    ).first()
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    return lead


@router.put("/{lead_id}", response_model=LeadResponse)
def update_lead(
    lead_id: int,
    lead_data: LeadUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a lead."""
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.user_id == current_user.id
    ).first()
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    # Update fields
    update_data = lead_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lead, field, value)
    
    db.commit()
    db.refresh(lead)
    return lead


@router.delete("/{lead_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lead(
    lead_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a lead."""
    lead = db.query(Lead).filter(
        Lead.id == lead_id,
        Lead.user_id == current_user.id
    ).first()
    
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lead not found"
        )
    
    db.delete(lead)
    db.commit()
    return None
