"""
Badge Domain Service
Evaluates point milestones and awards sustainability badges to students.
"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.badge import Badge, user_badges
from app.models.points import GreenPoint
from app.models.user import User

DEFAULT_BADGES = [
    {
        "name": "Eco Starter",
        "description": "Completed your first verified sustainability action on GreenCampus.",
        "icon": "🌱",
        "points_required": 10,
    },
    {
        "name": "Resource Saver",
        "description": "Helped conserve energy, water, or prevent campus wastage.",
        "icon": "💧",
        "points_required": 50,
    },
    {
        "name": "Green Sharer",
        "description": "Listed items on GreenShare and participated in the campus sharing economy.",
        "icon": "♻️",
        "points_required": 100,
    },
    {
        "name": "Community Helper",
        "description": "Active contributor across both ResourceCare and GreenShare initiatives.",
        "icon": "🤝",
        "points_required": 250,
    },
    {
        "name": "Sustainability Champion",
        "description": "Top-tier contributor demonstrating exceptional campus environmental leadership.",
        "icon": "🏆",
        "points_required": 500,
    },
]


def ensure_default_badges(db: Session) -> None:
    """Seeds predefined badges into the database if not present."""
    for badge_def in DEFAULT_BADGES:
        existing = db.query(Badge).filter(Badge.name == badge_def["name"]).first()
        if not existing:
            badge = Badge(
                name=badge_def["name"],
                description=badge_def["description"],
                icon=badge_def["icon"],
                points_required=badge_def["points_required"],
            )
            db.add(badge)
    db.commit()


def check_and_award_badges(db: Session, user_id: int) -> list:
    """
    Calculates total points for a user and awards any newly unlocked badges.
    Returns list of newly awarded Badge instances.
    """
    ensure_default_badges(db)

    # Sum total points from immutable ledger
    total_pts = (
        db.query(func.coalesce(func.sum(GreenPoint.points), 0))
        .filter(GreenPoint.user_id == user_id)
        .scalar()
    )

    # Get user and already earned badge IDs
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    earned_badge_ids = {b.id for b in user.badges}

    # Find qualifying unearned badges
    qualifying = (
        db.query(Badge)
        .filter(Badge.points_required <= total_pts, ~Badge.id.in_(earned_badge_ids) if earned_badge_ids else True)
        .all()
    )

    newly_awarded = []
    for badge in qualifying:
        if badge.id not in earned_badge_ids:
            user.badges.append(badge)
            newly_awarded.append(badge)

    if newly_awarded:
        db.commit()

    return newly_awarded
