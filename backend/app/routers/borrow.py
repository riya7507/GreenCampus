"""
GreenShare Borrow Requests & Transactions API Router
"""

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.borrow import BorrowRequest, BorrowTransaction
from app.models.user import User
from app.schemas.borrow import (
    BorrowRequestCreate,
    BorrowRequestRespond,
    BorrowRequestResponse,
    BorrowTransactionResponse,
)
from app.services.borrow_service import (
    complete_item_return,
    list_received_requests,
    list_sent_requests,
    list_user_transactions,
    request_item_to_borrow,
    respond_to_borrow_request,
)

router = APIRouter(prefix="/borrow", tags=["GreenShare Borrowing"])


def _format_request(req: BorrowRequest) -> BorrowRequestResponse:
    return BorrowRequestResponse(
        id=req.id,
        item_id=req.item_id,
        item_name=req.item.name if req.item else None,
        requester_id=req.requester_id,
        requester_name=req.requester.full_name if req.requester else None,
        owner_id=req.owner_id,
        owner_name=req.owner.full_name if req.owner else None,
        message=req.message,
        status=req.status,
        requested_at=req.requested_at,
        responded_at=req.responded_at,
    )


def _format_tx(tx: BorrowTransaction) -> BorrowTransactionResponse:
    return BorrowTransactionResponse(
        id=tx.id,
        item_id=tx.item_id,
        item_name=tx.item.name if tx.item else None,
        borrower_id=tx.borrower_id,
        borrower_name=tx.borrower.full_name if tx.borrower else None,
        owner_id=tx.owner_id,
        owner_name=tx.owner.full_name if tx.owner else None,
        borrowed_at=tx.borrowed_at,
        due_at=tx.due_at,
        returned_at=tx.returned_at,
        status=tx.status,
    )


@router.post("/request", response_model=BorrowRequestResponse, status_code=status.HTTP_201_CREATED)
def request_to_borrow_item(
    data: BorrowRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Sends a request to borrow an item from another student."""
    req = request_item_to_borrow(db, current_user, data.item_id, data.message)
    return _format_request(req)


@router.get("/requests/sent", response_model=List[BorrowRequestResponse])
def get_sent_borrow_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists requests sent by the current student."""
    requests = list_sent_requests(db, current_user.id)
    return [_format_request(r) for r in requests]


@router.get("/requests/received", response_model=List[BorrowRequestResponse])
def get_received_borrow_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists borrow requests received for items owned by the current student."""
    requests = list_received_requests(db, current_user.id)
    return [_format_request(r) for r in requests]


@router.post("/requests/{id}/respond", response_model=BorrowRequestResponse)
def respond_to_request(
    id: int,
    data: BorrowRequestRespond,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner approves or rejects a pending borrow request."""
    req = respond_to_borrow_request(db, current_user, id, data.status)
    return _format_request(req)


@router.get("/transactions", response_model=List[BorrowTransactionResponse])
def get_my_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists active and completed borrowing transactions for the current student."""
    transactions = list_user_transactions(db, current_user.id)
    return [_format_tx(t) for t in transactions]


@router.post("/transactions/{id}/return", response_model=BorrowTransactionResponse)
def confirm_return(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Confirms return of a borrowed item and awards return points (+10)."""
    tx = complete_item_return(db, current_user, id)
    return _format_tx(tx)
