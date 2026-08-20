from fastapi import APIRouter, HTTPException, Header, Depends, status
from typing import Optional
from backend.schemas.auth import RegisterRequest, LoginRequest, UserResponse
from backend.database.repositories import UserRepository

router = APIRouter(prefix="/api/auth", tags=["auth"])

def get_current_user(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None, alias="X-User-ID")
) -> dict:
    user_id = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        if token.startswith("user_"):
            try:
                user_id = int(token.replace("user_", ""))
            except ValueError:
                pass
        elif token.isdigit():
            user_id = int(token)
    elif x_user_id and x_user_id.isdigit():
        user_id = int(x_user_id)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )

    user = UserRepository.get_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists"
        )

    return user


@router.post("/register", response_model=UserResponse)
def register(req: RegisterRequest):
    clean_username = req.username.strip()
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be blank")

    user = UserRepository.get_or_create(clean_username)
    token = f"user_{user['id']}"
    return UserResponse(
        id=user['id'],
        username=user['username'],
        created_at=str(user.get('created_at', '')),
        token=token
    )


@router.post("/login", response_model=UserResponse)
def login(req: LoginRequest):
    clean_username = req.username.strip()
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be blank")

    user = UserRepository.get_by_username(clean_username)
    if not user:
        # Fallback to get_or_create to match current simple app behavior while remaining safe
        user = UserRepository.get_or_create(clean_username)

    token = f"user_{user['id']}"
    return UserResponse(
        id=user['id'],
        username=user['username'],
        created_at=str(user.get('created_at', '')),
        token=token
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    token = f"user_{current_user['id']}"
    return UserResponse(
        id=current_user['id'],
        username=current_user['username'],
        created_at=str(current_user.get('created_at', '')),
        token=token
    )
