from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from services.database import Base

class Sequence(Base):
    __tablename__ = "sequences"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    steps = relationship("SequenceStep", back_populates="sequence", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="sequence")

class SequenceStep(Base):
    __tablename__ = "sequence_steps"
    
    id = Column(Integer, primary_key=True, index=True)
    sequence_id = Column(Integer, ForeignKey("sequences.id"))
    step_number = Column(Integer)  # 1, 2, 3...
    wait_days = Column(Integer, default=0)  # Days to wait after previous step
    action_type = Column(String)  # 'email', 'whatsapp', 'linkedin'
    template_name = Column(String, nullable=True) # Reference to AI context type
    
    sequence = relationship("Sequence", back_populates="steps")
