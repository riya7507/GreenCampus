"""
GreenShare Item Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class ItemCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    condition: str = "good"
    image_url: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if len(trimmed) < 2:
            raise ValueError("Item name must be at least 2 characters long.")
        return trimmed

    @field_validator("condition")
    def validate_condition(cls, v: str) -> str:
        allowed = {"new", "like_new", "good", "fair"}
        if v.lower() not in allowed:
            raise ValueError(f"Condition must be one of: {', '.join(sorted(allowed))}")
        return v.lower()


class ItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int
    owner_name: Optional[str] = None
    name: str
    description: Optional[str]
    category: str
    condition: str
    image_url: Optional[str]
    availability_status: str
    status: Optional[str] = None
    created_at: datetime
    updated_at: datetime
