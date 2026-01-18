"""Lead model for CRM functionality."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from services.database import Base


class Lead(Base):
    """Lead/prospect model."""
    
    __tablename__ = "leads"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    company = Column(String, nullable=True)
    last_contacted_date = Column(DateTime(timezone=True), nullable=True)
    last_message = Column(Text, nullable=True)
    status = Column(String, default="active")  # active, needs_followup, stalled
    
    # Career & Freelance Expansion
    contact_type = Column(String, default="client")  # client, recruiter, hr
    resume_link = Column(String, nullable=True)
    tech_stack = Column(Text, nullable=True)  # Comma-separated or JSON string
    source_url = Column(String, nullable=True)  # URL where the contact was found
    phone = Column(String, nullable=True)
    
    # Sequences (Automation)
    sequence_id = Column(Integer, ForeignKey("sequences.id"), nullable=True)
    current_step_number = Column(Integer, default=0) # 0 = not started
    
    sequence = relationship("Sequence", back_populates="leads")
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Lead(id={self.id}, name={self.name}, status={self.status})>"
