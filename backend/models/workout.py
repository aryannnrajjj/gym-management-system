from pydantic import BaseModel
from typing import List, Optional

class Exercise(BaseModel):
    name: str
    sets: int
    reps: str        # "12-15" or "till failure"
    rest_seconds: int
    notes: Optional[str] = None

class WorkoutPlan(BaseModel):
    title: str
    description: str
    trainer_id: Optional[str] = None   # ← Optional karo
    assigned_to: Optional[str] = None
    exercises: List[Exercise]
    days_per_week: int