"""
Sustainability Dashboard API Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.dashboard import DashboardMetricsResponse
from app.services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="/dashboard", tags=["Impact Dashboard"])


@router.get("/", response_model=DashboardMetricsResponse)
def get_sustainability_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns campus-wide sustainability impact metrics, circular economy counts,
    and user-specific ranking and points.
    """
    summary = get_dashboard_summary(db, current_user)
    return DashboardMetricsResponse(**summary)
