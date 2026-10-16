"""
Authentication Schemas (DTOs)
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.core.security import validate_password_strength


class UserRegisterRequest(BaseModel):
    full_name: str
    email: EmailStr
    password: str

    @field_validator("full_name")
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Full name must be at least 2 characters long.")
        return trimmed

    @field_validator("password")
    def validate_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
