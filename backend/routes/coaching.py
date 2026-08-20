from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional
from backend.services.ai_coach import ai_coach_service

router = APIRouter(prefix="/api/coaching", tags=["coaching"])

class CoachingFeedbackRequest(BaseModel):
    event: str = Field(..., description="Event name (e.g. workout_started, ongoing_form_check, set_completed, workout_completed)")
    exercise: str = Field(..., description="Name of the exercise")
    metrics: Dict[str, Any] = Field(default_factory=dict, description="Latest exercise metrics")

class CoachingFeedbackResponse(BaseModel):
    feedback: Optional[str] = None

@router.post("/feedback", response_model=CoachingFeedbackResponse)
def get_coaching_feedback(req: CoachingFeedbackRequest):
    feedback = ai_coach_service.process_event(
        event=req.event,
        exercise=req.exercise,
        metrics=req.metrics
    )
    return CoachingFeedbackResponse(feedback=feedback)
