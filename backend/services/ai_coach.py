import os
from typing import Optional, Dict, Any
from groq import Groq
from services.coaching.llm import LLMCoach
from services.coaching.coaching_pipeline import CoachingPipeline

class AICoachService:
    def __init__(self):
        self._pipeline: Optional[CoachingPipeline] = None
        self._init_pipeline()

    def _init_pipeline(self):
        try:
            api_key = os.environ.get("GROQ_API_KEY", "")
            if api_key:
                groq_client = Groq(api_key=api_key)
                llm_coach = LLMCoach(groq_client)
                self._pipeline = CoachingPipeline(llm_coach)
        except Exception:
            self._pipeline = None

    def process_event(self, event: str, exercise: str, metrics: Dict[str, Any]) -> Optional[str]:
        if not self._pipeline:
            # Re-attempt initialization if API key was loaded later
            self._init_pipeline()
            
        if not self._pipeline:
            return None

        return self._pipeline.process_event(event, exercise, metrics)

# Shared singleton instance for API usage
ai_coach_service = AICoachService()
