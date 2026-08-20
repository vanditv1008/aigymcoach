from fastapi import APIRouter
from typing import Dict, Any
from backend.services.exercise_service import ExerciseService
from backend.schemas.workout import ExerciseConfigResponse

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

@router.get("", response_model=ExerciseConfigResponse)
def get_exercises():
    return ExerciseConfigResponse(
        exercises=ExerciseService.get_supported_exercises(),
        metrics_fields=ExerciseService.get_metrics_config()
    )

@router.get("/config")
def get_exercise_full_config() -> Dict[str, Any]:
    return ExerciseService.get_full_config()
