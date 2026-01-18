from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from services.database import get_db
from models.sequence import Sequence, SequenceStep
from models.user import User
from routes.auth import get_current_user
from schemas.sequence import SequenceCreate, SequenceResponse

router = APIRouter(prefix="/api/sequences", tags=["Sequences"])

@router.post("/", response_model=SequenceResponse)
def create_sequence(
    request: SequenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new multi-step outreach sequence."""
    # Check if name exists
    existing = db.query(Sequence).filter(Sequence.name == request.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sequence with this name already exists")
    
    sequence = Sequence(
        name=request.name,
        description=request.description
    )
    db.add(sequence)
    db.flush() # Get id
    
    for step_data in request.steps:
        step = SequenceStep(
            sequence_id=sequence.id,
            step_number=step_data.step_number,
            wait_days=step_data.wait_days,
            action_type=step_data.action_type,
            template_name=step_data.template_name
        )
        db.add(step)
    
    db.commit()
    db.refresh(sequence)
    return sequence

@router.get("/", response_model=List[SequenceResponse])
def get_sequences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available sequences."""
    return db.query(Sequence).all()
