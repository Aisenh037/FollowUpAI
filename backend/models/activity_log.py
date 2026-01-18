"""Activity log model for tracking agent actions."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from services.database import Base


class ActivityLog(Base):
    """Activity log for agent actions."""
    
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    action_type = Column(String, nullable=False)  # classified, sent_email, error
    details = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<ActivityLog(id={self.id}, action={self.action_type})>"
