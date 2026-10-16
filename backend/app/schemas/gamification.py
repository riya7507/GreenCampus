"""
Gamification & Leaderboard Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class GreenPointResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    points: int
    reason: str
    reference_type: Optional[str]
    created_at: datetime


class BadgeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str
    icon: str
    points_required: int
    is_earned: bool = False
    earned_at: Optional[datetime] = None


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    total_points: int
    badges_count: int
    is_current_user: bool = False
