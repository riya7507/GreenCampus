"""
ResourceCare Issues API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_admin, get_current_user
from app.models.issue import Issue
from app.models.user import User
from app.schemas.issue import (
    IssueCreateRequest,
    IssueResponse,
    IssueStatusUpdateRequest,
)
from app.services.issue_service import (
    create_issue_report,
    get_issue_by_id,
    list_all_issues,
    list_user_issues,
    update_issue_status_workflow,
)

router = APIRouter(prefix="/issues", tags=["ResourceCare"])


def _format_issue(issue: Issue) -> IssueResponse:
    """Helper to convert ORM model to response schema with populated names."""
    return IssueResponse(
        id=issue.id,
        reported_by=issue.reported_by,
        reporter_name=issue.reporter.full_name if issue.reporter else None,
        issue_type=issue.issue_type,
        description=issue.description,
        location=issue.location,
        image_url=issue.image_url,
        status=issue.status,
        assigned_to=issue.assigned_to,
        assignee_name=issue.assignee.full_name if issue.assignee else None,
        estimated_water_saved=issue.estimated_water_saved,
        estimated_energy_saved=issue.estimated_energy_saved,
        estimated_waste_reduced=issue.estimated_waste_reduced,
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        resolved_at=issue.resolved_at,
        updates=issue.updates,
    )


@router.post("/", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def submit_issue_report(
    data: IssueCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submits a new resource wastage report (Water, Electricity, Waste, etc.)."""
    issue = create_issue_report(db, current_user, data)
    return _format_issue(issue)


@router.get("/me", response_model=List[IssueResponse])
def get_my_issues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all reports submitted by the logged-in student."""
    issues = list_user_issues(db, current_user.id)
    return [_format_issue(i) for i in issues]


@router.get("/", response_model=List[IssueResponse])
def get_all_campus_issues(
    status_filter: Optional[str] = Query(None, alias="status"),
    type_filter: Optional[str] = Query(None, alias="type"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists campus issues feed with optional status and category filters."""
    issues = list_all_issues(db, status_filter, type_filter)
    return [_format_issue(i) for i in issues]


@router.get("/{id}", response_model=IssueResponse)
def get_single_issue_details(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves single issue with complete update timeline."""
    issue = get_issue_by_id(db, id)
    if not issue:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Issue not found.")
    return _format_issue(issue)


@router.patch("/{id}/status", response_model=IssueResponse)
def update_issue_status(
    id: int,
    data: IssueStatusUpdateRequest,
    admin_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Admin-only endpoint to update status, add comments, and log estimated resource savings."""
    updated = update_issue_status_workflow(db, id, admin_user, data)
    return _format_issue(updated)
