"""
ResourceCare Issue Schemas
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, field_validator


class IssueCreateRequest(BaseModel):
    issue_type: str  # water | electricity | waste | other
    description: str
    location: str
    image_url: Optional[str] = None

    @field_validator("issue_type")
    def validate_type(cls, v: str) -> str:
        allowed = {"water", "electricity", "waste", "other"}
        if v.lower() not in allowed:
            raise ValueError(f"Issue type must be one of: {', '.join(sorted(allowed))}")
        return v.lower()


class IssueStatusUpdateRequest(BaseModel):
    status: str  # reported | in_progress | resolved
    comment: Optional[str] = None
    assigned_to: Optional[int] = None
    estimated_water_saved: Optional[float] = 0.0
    estimated_energy_saved: Optional[float] = 0.0
    estimated_waste_reduced: Optional[float] = 0.0

    @field_validator("status")
    def validate_status(cls, v: str) -> str:
        allowed = {"reported", "in_progress", "resolved"}
        if v.lower() not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(sorted(allowed))}")
        return v.lower()


class IssueUpdateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    issue_id: int
    updated_by: int
    old_status: Optional[str]
    new_status: str
    comment: Optional[str]
    created_at: datetime


class IssueResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reported_by: int
    reporter_name: Optional[str] = None
    issue_type: str
    description: str
    location: str
    image_url: Optional[str]
    status: str
    assigned_to: Optional[int]
    assignee_name: Optional[str] = None
    estimated_water_saved: float
    estimated_energy_saved: float
    estimated_waste_reduced: float
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime]
    updates: List[IssueUpdateResponse] = []
