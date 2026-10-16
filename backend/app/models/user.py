"""
User ORM Model
Represents campus students and administrators in GreenCampus.
"""

from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student", nullable=False)  # student | admin
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships — ResourceCare
    reported_issues = relationship(
        "Issue",
        foreign_keys="[Issue.reported_by]",
        back_populates="reporter",
        cascade="all, delete-orphan",
    )
    assigned_issues = relationship(
        "Issue",
        foreign_keys="[Issue.assigned_to]",
        back_populates="assignee",
    )
    issue_updates = relationship(
        "IssueUpdate",
        back_populates="updater",
        cascade="all, delete-orphan",
    )

    # Relationships — GreenShare
    owned_items = relationship(
        "Item",
        back_populates="owner",
        cascade="all, delete-orphan",
    )
    borrow_requests_sent = relationship(
        "BorrowRequest",
        foreign_keys="[BorrowRequest.requester_id]",
        back_populates="requester",
        cascade="all, delete-orphan",
    )
    borrow_requests_received = relationship(
        "BorrowRequest",
        foreign_keys="[BorrowRequest.owner_id]",
        back_populates="owner",
    )
    borrow_transactions_as_borrower = relationship(
        "BorrowTransaction",
        foreign_keys="[BorrowTransaction.borrower_id]",
        back_populates="borrower",
    )
    borrow_transactions_as_owner = relationship(
        "BorrowTransaction",
        foreign_keys="[BorrowTransaction.owner_id]",
        back_populates="owner",
    )

    # Relationships — Points, Badges, Notifications & Impact
    green_points = relationship(
        "GreenPoint",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    badges = relationship(
        "Badge",
        secondary="user_badges",
        back_populates="users",
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    impact_records = relationship(
        "ImpactRecord",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
