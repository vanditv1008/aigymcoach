from typing import List, Dict, Any
from services.config.workout_config import EXERCISE_OPTIONS, METRICS_FIELDS, PROMPT

class ExerciseService:
    @staticmethod
    def get_supported_exercises() -> List[str]:
        return EXERCISE_OPTIONS

    @staticmethod
    def get_metrics_config() -> Dict[str, Any]:
        return METRICS_FIELDS

    @staticmethod
    def get_full_config() -> Dict[str, Any]:
        return {
            "exercises": EXERCISE_OPTIONS,
            "metrics_fields": METRICS_FIELDS,
            "system_prompt": PROMPT
        }
