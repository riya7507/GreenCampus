"""
Admin Schemas (DTOs)
Type definitions for Admin Portal analytics, user management, and impact audits.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class AdminAnalyticsResponse(BaseModel):
    total_users: int
    total_students: int
    total_admins: int
    total_issues: int
    pending_reports: int
    in_progress_reports: int
    resolved_reports: int
    total_items_listed: int
    available_items: int
    borrowed_items: int
    pending_borrow_requests: int
    total_borrow_cycles: int
    purchases_avoided_count: int
    total_green_points_awarded: int
    estimated_water_saved_litres: float
    estimated_energy_saved_kwh: float
    estimated_waste_reduced_kg: float


class AdminUserListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: str
    is_active: bool
    created_at: datetime
    green_points: int = 0
    reported_issues_count: int = 0
    items_listed_count: int = 0


class AdminUserRoleUpdate(BaseModel):
    role: str

    @field_validator("role")
    def validate_role(cls, v: str) -> str:
        v_clean = v.strip().lower()
        if v_clean not in ["student", "admin"]:
            raise ValueError("Role must be either 'student' or 'admin'.")
        return v_clean


class AdminImpactRecordItem(BaseModel):
    id: int
    user_name: Optional[str]
    issue_id: Optional[int]
    issue_type: Optional[str]
    water_saved: float
    energy_saved: float
    waste_reduced: float
    recorded_at: datetime


class AdminImpactResponse(BaseModel):
    estimated_water_saved_litres: float
    estimated_energy_saved_kwh: float
    estimated_waste_reduced_kg: float
    total_issues_resolved: int
    total_items_shared: int
    purchases_avoided: int
    recent_records: List[AdminImpactRecordItem]
