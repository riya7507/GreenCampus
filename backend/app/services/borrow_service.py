"""
GreenShare Borrow Lifecycle Service
Manages borrow requests, approvals, transactions, returns, and impact logging.
"""

from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.borrow import BorrowRequest, BorrowTransaction
from app.models.impact import ImpactRecord
from app.models.item import Item
from app.models.user import User
from app.services.notification_service import create_notification
from app.services.points_service import award_green_points


def request_item_to_borrow(
    db: Session,
    requester: User,
    item_id: int,
    message: Optional[str] = None,
) -> BorrowRequest:
    """Creates a borrow request and prevents duplicate/self-borrowing."""
    item = db.query(Item).filter(Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")

    if item.owner_id == requester.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot borrow your own item.",
        )

    if item.availability_status == "borrowed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item is currently borrowed by another student.",
        )

    # Check for existing active request
    existing = (
        db.query(BorrowRequest)
        .filter(
            BorrowRequest.item_id == item_id,
            BorrowRequest.requester_id == requester.id,
            BorrowRequest.status == "pending",
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active request pending for this item.",
        )

    req = BorrowRequest(
        item_id=item.id,
        requester_id=requester.id,
        owner_id=item.owner_id,
        message=message,
        status="pending",
    )
    item.availability_status = "requested"
    db.add(req)
    db.commit()
    db.refresh(req)

    # Notify owner
    create_notification(
        db,
        user_id=item.owner_id,
        title="New Borrow Request Received 🤝",
        message=f"{requester.full_name} wants to borrow your '{item.name}'.",
        notification_type="borrow_request",
    )

    return req


def respond_to_borrow_request(
    db: Session,
    owner: User,
    request_id: int,
    decision: str,  # "approved" | "rejected"
) -> BorrowRequest:
    """Processes owner's decision on a borrow request."""
    req = db.query(BorrowRequest).filter(BorrowRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found.")

    if req.owner_id != owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to respond to this request.",
        )

    if req.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Request has already been processed (current status: {req.status}).",
        )

    req.responded_at = datetime.now(timezone.utc)
    item = db.query(Item).filter(Item.id == req.item_id).first()

    if decision == "approved":
        req.status = "approved"
        if item:
            item.availability_status = "borrowed"

        # Create active borrow transaction (due in 7 days by default)
        tx = BorrowTransaction(
            item_id=req.item_id,
            borrower_id=req.requester_id,
            owner_id=req.owner_id,
            borrow_request_id=req.id,
            borrowed_at=datetime.now(timezone.utc),
            due_at=datetime.now(timezone.utc) + timedelta(days=7),
            status="active",
        )
        db.add(tx)

        # Notify borrower
        create_notification(
            db,
            user_id=req.requester_id,
            title="Borrow Request Approved! ✅",
            message=f"{owner.full_name} approved your request to borrow '{item.name if item else 'item'}'.",
            notification_type="borrow_approval",
        )

    else:
        req.status = "rejected"
        if item:
            item.availability_status = "available"

        # Notify borrower
        create_notification(
            db,
            user_id=req.requester_id,
            title="Borrow Request Declined",
            message=f"{owner.full_name} declined the request for '{item.name if item else 'item'}'.",
            notification_type="borrow_request",
        )

    db.commit()
    db.refresh(req)
    return req


def complete_item_return(
    db: Session,
    user: User,
    transaction_id: int,
) -> BorrowTransaction:
    """Marks a borrowed item as returned, releases the item, awards points, and logs avoided purchase."""
    tx = db.query(BorrowTransaction).filter(BorrowTransaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found.")

    if user.id not in (tx.borrower_id, tx.owner_id) and user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the borrower or owner can confirm return.",
        )

    if tx.status == "returned":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This transaction has already been completed.",
        )

    tx.returned_at = datetime.now(timezone.utc)
    tx.status = "returned"

    # Make item available again
    item = db.query(Item).filter(Item.id == tx.item_id).first()
    if item:
        item.availability_status = "available"

    # Record Impact (1 item shared, 1 purchase avoided)
    impact = ImpactRecord(
        user_id=tx.borrower_id,
        items_shared=1,
        purchases_avoided=1,
    )
    db.add(impact)

    # Award Green Points to both parties (+10 each)
    award_green_points(
        db,
        user_id=tx.owner_id,
        points=10,
        reason=f"Lent '{item.name if item else 'item'}' successfully",
        reference_type="borrow_return_owner",
        reference_id=tx.id,
    )
    award_green_points(
        db,
        user_id=tx.borrower_id,
        points=10,
        reason=f"Returned '{item.name if item else 'item'}' on time",
        reference_type="borrow_return_borrower",
        reference_id=tx.id,
    )

    db.commit()
    db.refresh(tx)
    return tx


def list_sent_requests(db: Session, user_id: int) -> List[BorrowRequest]:
    return db.query(BorrowRequest).filter(BorrowRequest.requester_id == user_id).order_by(BorrowRequest.requested_at.desc()).all()


def list_received_requests(db: Session, owner_id: int) -> List[BorrowRequest]:
    return db.query(BorrowRequest).filter(BorrowRequest.owner_id == owner_id).order_by(BorrowRequest.requested_at.desc()).all()


def list_user_transactions(db: Session, user_id: int) -> List[BorrowTransaction]:
    return (
        db.query(BorrowTransaction)
        .filter((BorrowTransaction.borrower_id == user_id) | (BorrowTransaction.owner_id == user_id))
        .order_by(BorrowTransaction.borrowed_at.desc())
        .all()
    )
