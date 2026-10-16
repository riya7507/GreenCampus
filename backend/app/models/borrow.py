"""
BorrowRequest & BorrowTransaction ORM Models
Manages the complete lending and borrowing lifecycle on GreenShare:
Request -> Review (Approve/Reject) -> Borrow (Active) -> Return.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class BorrowRequest(Base):
    __tablename__ = "borrow_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    requester_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=True)
    status = Column(
        String(20),
        default="pending",
        nullable=False,
        index=True,
    )  # pending | approved | rejected | cancelled

    requested_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    responded_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    item = relationship("Item", back_populates="borrow_requests")
    requester = relationship("User", foreign_keys=[requester_id], back_populates="borrow_requests_sent")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="borrow_requests_received")
    transaction = relationship("BorrowTransaction", back_populates="borrow_request", uselist=False)

    def __repr__(self) -> str:
        return f"<BorrowRequest id={self.id} item_id={self.item_id} status={self.status}>"


class BorrowTransaction(Base):
    __tablename__ = "borrow_transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    item_id = Column(Integer, ForeignKey("items.id", ondelete="CASCADE"), nullable=False, index=True)
    borrower_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    borrow_request_id = Column(Integer, ForeignKey("borrow_requests.id", ondelete="SET NULL"), nullable=True, index=True)

    borrowed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    due_at = Column(DateTime(timezone=True), nullable=True)
    returned_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(
        String(20),
        default="active",
        nullable=False,
        index=True,
    )  # active | returned | overdue

    # Relationships
    item = relationship("Item", back_populates="borrow_transactions")
    borrower = relationship("User", foreign_keys=[borrower_id], back_populates="borrow_transactions_as_borrower")
    owner = relationship("User", foreign_keys=[owner_id], back_populates="borrow_transactions_as_owner")
    borrow_request = relationship("BorrowRequest", back_populates="transaction")

    def __repr__(self) -> str:
        return f"<BorrowTransaction id={self.id} item_id={self.item_id} status={self.status}>"
