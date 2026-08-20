from dataclasses import dataclass
from typing import Optional

@dataclass
class Workout:
    id: int
    user_id: int
    exercise_name: str
    reps: int
    sets: int
    time: int
    created_at: Optional[str] = None
