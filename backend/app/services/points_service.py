"""
Green Points Domain Service
Maintains immutable ledger of sustainability points, guards against duplicate awards,
and automatically triggers badge checks and notification creation.
"""

from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.points import GreenPoint
from app.services.badge_service import check_and_award_badges
from app.services.notification_service import create_notification


def award_green_points(
    db: Session,
    user_id: int,
    points: int,
    reason: str,
    reference_type: Optional[str] = None,
    reference_id: Optional[int] = None,
) -> Optional[GreenPoint]:
    """
    Awards Green Points to a user.
    Enforces duplicate prevention: if reference_type and reference_id already exist,
    returns the existing record rather than awarding duplicate points.
    """
    if reference_type and reference_id:
        existing = (
            db.query(GreenPoint)
            .filter(
                GreenPoint.user_id == user_id,
                GreenPoint.reference_type == reference_type,
                GreenPoint.reference_id == reference_id,
            )
            .first()
        )
        if existing:
            return None  # Duplicate prevented

    record = GreenPoint(
        user_id=user_id,
        points=points,
        reason=reason,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # In-app notification for points earned
    create_notification(
        db,
        user_id=user_id,
        title="Green Points Earned! 🌱",
        message=f"You earned +{points} Green Points for: {reason}.",
        notification_type="points_earned",
    )

    # Check for unlocked badges
    new_badges = check_and_award_badges(db, user_id)
    for b in new_badges:
        create_notification(
            db,
            user_id=user_id,
            title="New Badge Unlocked! 🏆",
            message=f"Congratulations! You unlocked the '{b.name}' badge ({b.icon}).",
            notification_type="badge_earned",
        )

    return record


def get_user_total_points(db: Session, user_id: int) -> int:
    """Returns the total aggregated points from the immutable ledger."""
    total = (
        db.query(func.coalesce(func.sum(GreenPoint.points), 0))
        .filter(GreenPoint.user_id == user_id)
        .scalar()
    )
    return int(total)
