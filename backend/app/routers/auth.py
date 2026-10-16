"""
Authentication API Router
Endpoints:
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- GET /api/v1/auth/me
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    data: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Registers a new student user.
    - Validates email format and uniqueness.
    - Enforces 5-point password complexity.
    - Generates bcrypt hash (never stores plaintext).
    - Assigns 'student' role by default (admin cannot be registered via public endpoint).
    """
    normalized_email = data.email.lower().strip()

    # Reject duplicate email
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )

    # Securely hash password
    hashed_pwd = get_password_hash(data.password)

    user = User(
        full_name=data.full_name.strip(),
        email=normalized_email,
        password_hash=hashed_pwd,
        role="student",  # Always student by default
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=TokenResponse)
def login_user(
    data: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticates user with email and password.
    Returns JWT bearer token and user profile on success.
    """
    normalized_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email or password is incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    # Issue signed JWT
    access_token = create_access_token(subject=user.id, role=user.role)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves the currently authenticated user.
    Requires a valid JWT in Authorization header.
    Never returns password_hash.
    """
    return current_user
