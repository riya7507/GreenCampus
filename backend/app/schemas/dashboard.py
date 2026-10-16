"""
Sustainability Impact Dashboard Schemas
"""

from typing import Any, List
from pydantic import BaseModel


class DashboardMetricsResponse(BaseModel):
    # Aggregated conservation metrics (clearly identified as estimated)
    estimated_water_saved_litres: float
    estimated_energy_saved_kwh: float
    estimated_waste_reduced_kg: float

    # Circular sharing economy metrics
    items_shared_count: int
    purchases_avoided_count: int

    # Issues resolved
    issues_resolved_count: int
    issues_reported_total: int

    # Current user gamification stats
    user_total_points: int
    user_rank: int
    user_badges_count: int

    # Recent activity stream
    recent_activity: List[Any] = []
