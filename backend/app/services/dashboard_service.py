"""
Sustainability Dashboard Domain Service
Aggregates campus-wide environmental metrics and student gamification stats.
"""

from typing import Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.impact import ImpactRecord
from app.models.issue import Issue
from app.models.points import GreenPoint
from app.models.user import User


def get_dashboard_summary(db: Session, current_user: User) -> Dict[str, Any]:
    """Computes high-performance aggregate metrics for the dashboard."""
    # Campus-wide environmental impact
    totals = (
        db.query(
            func.coalesce(func.sum(ImpactRecord.water_saved), 0.0).label("water"),
            func.coalesce(func.sum(ImpactRecord.energy_saved), 0.0).label("energy"),
            func.coalesce(func.sum(ImpactRecord.waste_reduced), 0.0).label("waste"),
            func.coalesce(func.sum(ImpactRecord.items_shared), 0).label("items"),
            func.coalesce(func.sum(ImpactRecord.purchases_avoided), 0).label("purchases"),
        )
        .first()
    )

    water_saved = float(totals.water if totals else 0.0)
    energy_saved = float(totals.energy if totals else 0.0)
    waste_reduced = float(totals.waste if totals else 0.0)
    items_shared = int(totals.items if totals else 0)
    purchases_avoided = int(totals.purchases if totals else 0)

    # Campus-wide issues counts
    issues_resolved = db.query(func.count(Issue.id)).filter(Issue.status == "resolved").scalar() or 0
    issues_total = db.query(func.count(Issue.id)).scalar() or 0

    # Current user gamification stats
    user_pts = (
        db.query(func.coalesce(func.sum(GreenPoint.points), 0))
        .filter(GreenPoint.user_id == current_user.id)
        .scalar()
        or 0
    )
    user_badges_count = len(current_user.badges) if current_user.badges else 0

    # User ranking calculation
    # Count how many users have strictly more points than current user + 1
    subq = (
        db.query(GreenPoint.user_id, func.sum(GreenPoint.points).label("pts"))
        .group_by(GreenPoint.user_id)
        .subquery()
    )
    higher_count = (
        db.query(func.count(subq.c.user_id))
        .filter(subq.c.pts > user_pts)
        .scalar()
        or 0
    )
    user_rank = higher_count + 1

    # Recent activities (last 5 points transactions)
    recent_records = (
        db.query(GreenPoint)
        .filter(GreenPoint.user_id == current_user.id)
        .order_by(GreenPoint.created_at.desc())
        .limit(5)
        .all()
    )
    recent_activity = [
        {
            "id": r.id,
            "type": "points",
            "points": r.points,
            "description": r.reason,
            "date": r.created_at.isoformat() if r.created_at else None,
        }
        for r in recent_records
    ]

    return {
        "estimated_water_saved_litres": round(water_saved, 1),
        "estimated_energy_saved_kwh": round(energy_saved, 1),
        "estimated_waste_reduced_kg": round(waste_reduced, 1),
        "items_shared_count": items_shared,
        "purchases_avoided_count": purchases_avoided,
        "issues_resolved_count": issues_resolved,
        "issues_reported_total": issues_total,
        "user_total_points": int(user_pts),
        "user_rank": user_rank,
        "user_badges_count": user_badges_count,
        "recent_activity": recent_activity,
    }
