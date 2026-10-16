"""
Admin Operations API Router
Protected endpoints accessible exclusively to users with 'admin' role.
Provides centralized monitoring, resource issue management, circular economy tracking,
user directory administration, and sustainability impact audits.
"""

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.db.session import get_db
from app.dependencies.auth import get_current_admin
from app.models.borrow import BorrowRequest, BorrowTransaction
from app.models.impact import ImpactRecord
from app.models.issue import Issue
from app.models.item import Item
from app.models.points import GreenPoint
from app.models.user import User
from app.schemas.admin import (
    AdminAnalyticsResponse,
    AdminImpactRecordItem,
    AdminImpactResponse,
    AdminUserListItem,
    AdminUserRoleUpdate,
)

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_admin_analytics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Retrieves system-wide sustainability management analytics directly from the MySQL database.
    Environmental savings are computed from verified records and clearly presented as estimates.
    """
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_students = db.query(func.count(User.id)).filter(User.role == "student").scalar() or 0
    total_admins = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0

    total_issues = db.query(func.count(Issue.id)).scalar() or 0
    pending_reports = db.query(func.count(Issue.id)).filter(Issue.status == "reported").scalar() or 0
    in_progress_reports = db.query(func.count(Issue.id)).filter(Issue.status == "in_progress").scalar() or 0
    resolved_reports = db.query(func.count(Issue.id)).filter(Issue.status == "resolved").scalar() or 0

    total_items = db.query(func.count(Item.id)).scalar() or 0
    available_items = db.query(func.count(Item.id)).filter(Item.availability_status == "available").scalar() or 0
    borrowed_items = db.query(func.count(Item.id)).filter(Item.availability_status == "borrowed").scalar() or 0

    pending_borrow_requests = db.query(func.count(BorrowRequest.id)).filter(BorrowRequest.status == "pending").scalar() or 0
    total_transactions = db.query(func.count(BorrowTransaction.id)).scalar() or 0
    purchases_avoided = db.query(func.count(BorrowTransaction.id)).filter(BorrowTransaction.status == "returned").scalar() or 0

    total_points = db.query(func.coalesce(func.sum(GreenPoint.points), 0)).scalar() or 0

    impact = (
        db.query(
            func.coalesce(func.sum(ImpactRecord.water_saved), 0.0).label("water"),
            func.coalesce(func.sum(ImpactRecord.energy_saved), 0.0).label("energy"),
            func.coalesce(func.sum(ImpactRecord.waste_reduced), 0.0).label("waste"),
        )
        .first()
    )

    return AdminAnalyticsResponse(
        total_users=total_users,
        total_students=total_students,
        total_admins=total_admins,
        total_issues=total_issues,
        pending_reports=pending_reports,
        in_progress_reports=in_progress_reports,
        resolved_reports=resolved_reports,
        total_items_listed=total_items,
        available_items=available_items,
        borrowed_items=borrowed_items,
        pending_borrow_requests=pending_borrow_requests,
        total_borrow_cycles=total_transactions,
        purchases_avoided_count=purchases_avoided,
        total_green_points_awarded=int(total_points),
        estimated_water_saved_litres=round(float(impact.water if impact else 0.0), 1),
        estimated_energy_saved_kwh=round(float(impact.energy if impact else 0.0), 1),
        estimated_waste_reduced_kg=round(float(impact.waste if impact else 0.0), 1),
    )


@router.get("/users", response_model=List[AdminUserListItem])
def get_all_users(
    role: Optional[str] = Query(None, description="Filter by role: student | admin"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Lists registered campus accounts with their aggregated points and activity stats.
    Never exposes passwords or sensitive credentials.
    """
    query = db.query(User)

    if role and role.lower() in ["student", "admin"]:
        query = query.filter(User.role == role.lower())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                User.full_name.ilike(search_term),
                User.email.ilike(search_term),
            )
        )

    users = query.order_by(User.created_at.desc()).all()

    # Annotate points and activity for each user
    results = []
    for u in users:
        pts = db.query(func.coalesce(func.sum(GreenPoint.points), 0)).filter(GreenPoint.user_id == u.id).scalar() or 0
        issues_count = db.query(func.count(Issue.id)).filter(Issue.reported_by == u.id).scalar() or 0
        items_count = db.query(func.count(Item.id)).filter(Item.owner_id == u.id).scalar() or 0

        results.append(
            AdminUserListItem(
                id=u.id,
                full_name=u.full_name,
                email=u.email,
                role=u.role,
                is_active=u.is_active,
                created_at=u.created_at,
                green_points=int(pts),
                reported_issues_count=issues_count,
                items_listed_count=items_count,
            )
        )

    return results


@router.patch("/users/{user_id}/role", response_model=AdminUserListItem)
def update_user_role(
    user_id: int,
    data: AdminUserRoleUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Safely changes a user's role between 'student' and 'admin'.
    Guards against self-demotion if the admin is the only active admin.
    """
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    # Guard: prevent removing own admin access if only 1 admin remains
    if target.id == admin.id and data.role == "student":
        admin_count = db.query(func.count(User.id)).filter(User.role == "admin").scalar() or 0
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the sole campus administrator.",
            )

    target.role = data.role
    db.commit()
    db.refresh(target)

    pts = db.query(func.coalesce(func.sum(GreenPoint.points), 0)).filter(GreenPoint.user_id == target.id).scalar() or 0
    issues_count = db.query(func.count(Issue.id)).filter(Issue.reported_by == target.id).scalar() or 0
    items_count = db.query(func.count(Item.id)).filter(Item.owner_id == target.id).scalar() or 0

    return AdminUserListItem(
        id=target.id,
        full_name=target.full_name,
        email=target.email,
        role=target.role,
        is_active=target.is_active,
        created_at=target.created_at,
        green_points=int(pts),
        reported_issues_count=issues_count,
        items_listed_count=items_count,
    )


@router.get("/greenshare/items")
def get_admin_greenshare_items(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Lists all circular economy items listed by campus students."""
    items = db.query(Item).order_by(Item.created_at.desc()).all()
    results = []
    for it in items:
        results.append({
            "id": it.id,
            "name": it.name,
            "description": it.description,
            "category": it.category,
            "condition": it.condition,
            "status": it.availability_status,
            "owner_id": it.owner_id,
            "owner_name": it.owner.full_name if it.owner else "Unknown",
            "owner_email": it.owner.email if it.owner else "",
            "created_at": it.created_at.isoformat() if it.created_at else None,
        })
    return results


@router.get("/greenshare/requests")
def get_admin_greenshare_requests(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Lists all peer borrow requests across campus."""
    requests = db.query(BorrowRequest).order_by(BorrowRequest.requested_at.desc()).all()
    results = []
    for r in requests:
        results.append({
            "id": r.id,
            "item_id": r.item_id,
            "item_name": r.item.name if r.item else f"Item #{r.item_id}",
            "requester_id": r.requester_id,
            "requester_name": r.requester.full_name if r.requester else "Student",
            "requester_email": r.requester.email if r.requester else "",
            "owner_id": r.owner_id,
            "owner_name": r.owner.full_name if r.owner else "Owner",
            "status": r.status,
            "message": r.message,
            "requested_at": r.requested_at.isoformat() if r.requested_at else None,
            "responded_at": r.responded_at.isoformat() if r.responded_at else None,
        })
    return results


@router.get("/greenshare/transactions")
def get_admin_greenshare_transactions(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Lists all active and completed circular borrow transactions."""
    transactions = db.query(BorrowTransaction).order_by(BorrowTransaction.borrowed_at.desc()).all()
    results = []
    for tx in transactions:
        results.append({
            "id": tx.id,
            "item_id": tx.item_id,
            "item_name": tx.item.name if tx.item else f"Item #{tx.item_id}",
            "borrower_id": tx.borrower_id,
            "borrower_name": tx.borrower.full_name if tx.borrower else "Borrower",
            "owner_id": tx.owner_id,
            "owner_name": tx.owner.full_name if tx.owner else "Owner",
            "status": tx.status,
            "borrowed_at": tx.borrowed_at.isoformat() if tx.borrowed_at else None,
            "due_at": tx.due_at.isoformat() if tx.due_at else None,
            "returned_at": tx.returned_at.isoformat() if tx.returned_at else None,
        })
    return results


@router.get("/impact", response_model=AdminImpactResponse)
def get_admin_sustainability_impact(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Retrieves full environmental savings metrics and recent impact ledger entries.
    All figures are estimated from resolved leak/wastage repairs and item reuse cycles.
    """
    impact = (
        db.query(
            func.coalesce(func.sum(ImpactRecord.water_saved), 0.0).label("water"),
            func.coalesce(func.sum(ImpactRecord.energy_saved), 0.0).label("energy"),
            func.coalesce(func.sum(ImpactRecord.waste_reduced), 0.0).label("waste"),
        )
        .first()
    )

    resolved_count = db.query(func.count(Issue.id)).filter(Issue.status == "resolved").scalar() or 0
    items_shared_count = db.query(func.count(Item.id)).scalar() or 0
    purchases_avoided = db.query(func.count(BorrowTransaction.id)).filter(BorrowTransaction.status == "returned").scalar() or 0

    recent_records = (
        db.query(ImpactRecord)
        .order_by(ImpactRecord.recorded_at.desc())
        .limit(20)
        .all()
    )

    recent_list = []
    for rec in recent_records:
        recent_list.append(
            AdminImpactRecordItem(
                id=rec.id,
                user_name=rec.user.full_name if rec.user else None,
                issue_id=rec.issue_id,
                issue_type=rec.issue.issue_type if rec.issue else None,
                water_saved=float(rec.water_saved or 0.0),
                energy_saved=float(rec.energy_saved or 0.0),
                waste_reduced=float(rec.waste_reduced or 0.0),
                recorded_at=rec.recorded_at,
            )
        )

    return AdminImpactResponse(
        estimated_water_saved_litres=round(float(impact.water if impact else 0.0), 1),
        estimated_energy_saved_kwh=round(float(impact.energy if impact else 0.0), 1),
        estimated_waste_reduced_kg=round(float(impact.waste if impact else 0.0), 1),
        total_issues_resolved=resolved_count,
        total_items_shared=items_shared_count,
        purchases_avoided=purchases_avoided,
        recent_records=recent_list,
    )


@router.get("/staff")
def get_assignable_staff(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> List[Dict[str, Any]]:
    """Returns list of administrators and staff members who can be assigned to issues."""
    staff_users = db.query(User).filter(User.role == "admin", User.is_active == True).all()
    return [{"id": s.id, "name": s.full_name, "email": s.email} for s in staff_users]
