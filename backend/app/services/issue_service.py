"""
ResourceCare Domain Service
Handles issue report creation, status progression audit trails,
estimated resource savings recording, and impact aggregation.
"""

from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.impact import ImpactRecord
from app.models.issue import Issue, IssueUpdate
from app.models.user import User
from app.schemas.issue import IssueCreateRequest, IssueStatusUpdateRequest
from app.services.notification_service import create_notification
from app.services.points_service import award_green_points


def create_issue_report(
    db: Session,
    user: User,
    data: IssueCreateRequest,
) -> Issue:
    """Creates a new ResourceCare issue report with an initial audit entry."""
    issue = Issue(
        reported_by=user.id,
        issue_type=data.issue_type,
        description=data.description,
        location=data.location,
        image_url=data.image_url,
        status="reported",
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)

    # Initial audit update
    initial_update = IssueUpdate(
        issue_id=issue.id,
        updated_by=user.id,
        old_status=None,
        new_status="reported",
        comment="Issue reported via ResourceCare mobile app.",
    )
    db.add(initial_update)
    db.commit()

    # Award Green Points (+10) for reporting wastage (duplicate prevented by reference_type)
    award_green_points(
        db,
        user_id=user.id,
        points=10,
        reason=f"Reported {data.issue_type.title()} issue at {data.location}",
        reference_type="reported_issue",
        reference_id=issue.id,
    )

    create_notification(
        db,
        user_id=user.id,
        title="Issue Report Submitted",
        message=f"Your {data.issue_type} report has been received and queued for review.",
        notification_type="issue_update",
    )

    db.refresh(issue)
    return issue


def update_issue_status_workflow(
    db: Session,
    issue_id: int,
    updater: User,
    data: IssueStatusUpdateRequest,
) -> Issue:
    """
    Updates the status of an issue (admin action), creates an audit log entry,
    and if resolved, records estimated impact metrics and awards bonus points to the reporter.
    """
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Issue report not found.",
        )

    old_status = issue.status
    new_status = data.status

    issue.status = new_status
    if data.assigned_to is not None:
        issue.assigned_to = data.assigned_to

    if new_status == "resolved" and old_status != "resolved":
        issue.resolved_at = datetime.now(timezone.utc)
        if data.estimated_water_saved is not None:
            issue.estimated_water_saved = data.estimated_water_saved
        if data.estimated_energy_saved is not None:
            issue.estimated_energy_saved = data.estimated_energy_saved
        if data.estimated_waste_reduced is not None:
            issue.estimated_waste_reduced = data.estimated_waste_reduced

        # Create or update ImpactRecord
        impact = db.query(ImpactRecord).filter(ImpactRecord.issue_id == issue.id).first()
        if not impact:
            impact = ImpactRecord(
                user_id=issue.reported_by,
                issue_id=issue.id,
                water_saved=issue.estimated_water_saved,
                energy_saved=issue.estimated_energy_saved,
                waste_reduced=issue.estimated_waste_reduced,
            )
            db.add(impact)
        else:
            impact.water_saved = issue.estimated_water_saved
            impact.energy_saved = issue.estimated_energy_saved
            impact.waste_reduced = issue.estimated_waste_reduced

        # Award resolution points (+20) to original reporter
        award_green_points(
            db,
            user_id=issue.reported_by,
            points=20,
            reason=f"Resolved {issue.issue_type.title()} issue: {issue.location}",
            reference_type="resolved_issue",
            reference_id=issue.id,
        )

    # Log audit entry
    update_log = IssueUpdate(
        issue_id=issue.id,
        updated_by=updater.id,
        old_status=old_status,
        new_status=new_status,
        comment=data.comment or f"Status transitioned from {old_status} to {new_status}.",
    )
    db.add(update_log)
    db.commit()
    db.refresh(issue)

    # Notify reporter about status update
    create_notification(
        db,
        user_id=issue.reported_by,
        title="Issue Status Updated 🛠️",
        message=f"Your issue '{issue.description[:30]}...' is now marked as {new_status.title()}.",
        notification_type="issue_update",
    )

    return issue


def get_issue_by_id(db: Session, issue_id: int) -> Optional[Issue]:
    """Retrieves an issue by ID with eager loading."""
    return db.query(Issue).filter(Issue.id == issue_id).first()


def list_user_issues(db: Session, user_id: int) -> List[Issue]:
    """Lists all issues reported by a specific student."""
    return db.query(Issue).filter(Issue.reported_by == user_id).order_by(Issue.created_at.desc()).all()


def list_all_issues(
    db: Session,
    status_filter: Optional[str] = None,
    type_filter: Optional[str] = None,
) -> List[Issue]:
    """Lists campus issues with optional filtering."""
    query = db.query(Issue)
    if status_filter:
        query = query.filter(Issue.status == status_filter)
    if type_filter:
        query = query.filter(Issue.issue_type == type_filter)
    return query.order_by(Issue.created_at.desc()).all()
