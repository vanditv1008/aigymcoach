from pydantic import BaseModel, Field
from typing import Optional

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="Unique username")

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50, description="Unique username")

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: Optional[str] = None
    token: str
