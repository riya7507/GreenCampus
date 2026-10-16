"""
Gamification API Router
Handles points ledger, badge awards, and campus leaderboard ranking.
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.badge import Badge
from app.models.points import GreenPoint
from app.models.user import User
from app.schemas.gamification import (
    BadgeResponse,
    GreenPointResponse,
    LeaderboardEntry,
)
from app.services.badge_service import ensure_default_badges

router = APIRouter(prefix="/gamification", tags=["Gamification & Leaderboard"])


@router.get("/points/me", response_model=List[GreenPointResponse])
def get_my_points_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves full immutable point history for the current user."""
    records = (
        db.query(GreenPoint)
        .filter(GreenPoint.user_id == current_user.id)
        .order_by(GreenPoint.created_at.desc())
        .all()
    )
    return records


@router.get("/badges", response_model=List[BadgeResponse])
def get_all_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists all available badges with current user's earned status indicated."""
    ensure_default_badges(db)
    badges = db.query(Badge).order_by(Badge.points_required.asc()).all()
    earned_ids = {b.id for b in current_user.badges}

    result = []
    for b in badges:
        is_earned = b.id in earned_ids
        result.append(
            BadgeResponse(
                id=b.id,
                name=b.name,
                description=b.description,
                icon=b.icon,
                points_required=b.points_required,
                is_earned=is_earned,
            )
        )
    return result


@router.get("/leaderboard", response_model=List[LeaderboardEntry])
def get_campus_leaderboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns campus-wide leaderboard ranked strictly by verified Green Points.
    Respects privacy by displaying only full_name, rank, badges, and points.
    """
    # Subquery summing points per user
    pts_subq = (
        db.query(
            GreenPoint.user_id,
            func.coalesce(func.sum(GreenPoint.points), 0).label("total_pts"),
        )
        .group_by(GreenPoint.user_id)
        .subquery()
    )

    # Join with users
    rows = (
        db.query(
            User.id,
            User.full_name,
            func.coalesce(pts_subq.c.total_pts, 0).label("pts"),
        )
        .outerjoin(pts_subq, User.id == pts_subq.c.user_id)
        .filter(User.is_active == True)
        .order_by(pts_subq.c.total_pts.desc().nullslast(), User.full_name.asc())
        .limit(50)
        .all()
    )

    leaderboard = []
    for rank, row in enumerate(rows, start=1):
        u = db.query(User).filter(User.id == row.id).first()
        b_count = len(u.badges) if u and u.badges else 0
        leaderboard.append(
            LeaderboardEntry(
                rank=rank,
                user_id=row.id,
                full_name=row.full_name,
                total_points=int(row.pts),
                badges_count=b_count,
                is_current_user=(row.id == current_user.id),
            )
        )

    return leaderboard
