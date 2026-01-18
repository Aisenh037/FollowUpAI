"""Agent schemas."""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class AgentRunResponse(BaseModel):
    """Schema for agent run response."""
    success: bool
    leads_processed: int
    emails_sent: int
    activities: List[dict]
    message: str


class ActivityLogResponse(BaseModel):
    """Schema for activity log response."""
    id: int
    user_id: int
    lead_id: Optional[int]
    action_type: str
    details: Optional[dict]
    created_at: datetime
    
    class Config:
        from_attributes = True
