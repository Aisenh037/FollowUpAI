"""Lead schemas."""
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class LeadCreate(BaseModel):
    """Schema for creating a lead."""
    name: str
    email: EmailStr
    company: Optional[str] = None
    last_contacted_date: Optional[datetime] = None
    last_message: Optional[str] = None
    contact_type: Optional[str] = "client"
    resume_link: Optional[str] = None
    tech_stack: Optional[str] = None
    source_url: Optional[str] = None
    phone: Optional[str] = None


class LeadUpdate(BaseModel):
    """Schema for updating a lead."""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    company: Optional[str] = None
    last_contacted_date: Optional[datetime] = None
    last_message: Optional[str] = None
    status: Optional[str] = None
    contact_type: Optional[str] = None
    resume_link: Optional[str] = None
    tech_stack: Optional[str] = None
    source_url: Optional[str] = None
    phone: Optional[str] = None
    sequence_id: Optional[int] = None
    current_step_number: Optional[int] = None


class LeadResponse(BaseModel):
    """Schema for lead response."""
    id: int
    user_id: int
    name: str
    email: str
    company: Optional[str]
    last_contacted_date: Optional[datetime]
    last_message: Optional[str]
    status: str
    contact_type: str
    resume_link: Optional[str]
    tech_stack: Optional[str]
    source_url: Optional[str]
    phone: Optional[str]
    sequence_id: Optional[int]
    current_step_number: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
