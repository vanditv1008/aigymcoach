from services.config.workout_config import PROMPT


class LLMCoach:
    def __init__(self, groq_client):
        self.client = groq_client
        self.history = []
        self.system_prompt = PROMPT

    def give_feedback(self, event, issue):
        prompt = f"Event: {event}"

        if issue:
            prompt += f" Form Issue: {issue}"

        messages = [
            {"role": "system", "content": self.system_prompt},
            *self.history[-10:],
            {"role": "user", "content": prompt}
        ]

        models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "llama3-70b-8192"]
        text = None

        for model_name in models_to_try:
            try:
                response = self.client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=0.4,
                )
                text = response.choices[0].message.content.strip()
                if text:
                    break
            except Exception:
                continue

        if not text:
            if issue:
                text = f"Form check: {issue}"
            else:
                text = f"Keep up the good work on your {event.replace('_', ' ')}!"

        self.history.append({"role": "assistant", "content": text})

        return text
    