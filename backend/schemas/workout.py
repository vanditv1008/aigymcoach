from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class WorkoutCreate(BaseModel):
    exercise_name: str = Field(..., description="Name of the exercise")
    reps: int = Field(..., ge=0, description="Total repetitions completed")
    sets: int = Field(..., ge=0, description="Total sets completed")
    time_taken: int = Field(0, ge=0, description="Time taken in seconds")

class WorkoutResponse(BaseModel):
    id: int
    user_id: int
    exercise_name: str
    reps: int
    sets: int
    time: int
    created_at: Optional[str] = None

class WorkoutHistoryResponse(BaseModel):
    workouts: List[WorkoutResponse]

class ExerciseConfigResponse(BaseModel):
    exercises: List[str]
    metrics_fields: Dict[str, Any]
