"""
GreenShare Borrow Schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, field_validator


class BorrowRequestCreate(BaseModel):
    item_id: int
    message: Optional[str] = None


class BorrowRequestRespond(BaseModel):
    status: str  # approved | rejected

    @field_validator("status")
    def validate_status(cls, v: str) -> str:
        allowed = {"approved", "rejected"}
        if v.lower() not in allowed:
            raise ValueError("Response status must be 'approved' or 'rejected'.")
        return v.lower()


class BorrowRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: Optional[str] = None
    requester_id: int
    requester_name: Optional[str] = None
    owner_id: int
    owner_name: Optional[str] = None
    message: Optional[str]
    status: str
    requested_at: datetime
    responded_at: Optional[datetime]


class BorrowTransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: Optional[str] = None
    borrower_id: int
    borrower_name: Optional[str] = None
    owner_id: int
    owner_name: Optional[str] = None
    borrowed_at: datetime
    due_at: Optional[datetime]
    returned_at: Optional[datetime]
    status: str
