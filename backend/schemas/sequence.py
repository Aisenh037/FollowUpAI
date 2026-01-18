from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime

class SequenceStepBase(BaseModel):
    step_number: int
    wait_days: int
    action_type: str # 'email', 'whatsapp'
    template_name: Optional[str] = None

class SequenceStepCreate(SequenceStepBase):
    pass

class SequenceStepResponse(SequenceStepBase):
    id: int
    sequence_id: int
    model_config = ConfigDict(from_attributes=True)

class SequenceBase(BaseModel):
    name: str
    description: Optional[str] = None

class SequenceCreate(SequenceBase):
    steps: List[SequenceStepCreate]

class SequenceResponse(SequenceBase):
    id: int
    created_at: datetime
    steps: List[SequenceStepResponse]
    model_config = ConfigDict(from_attributes=True)
