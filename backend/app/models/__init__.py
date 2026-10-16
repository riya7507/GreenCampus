"""
GreenCampus Database Models Registry
Imports and exposes all SQLAlchemy models to ensure their table definitions
are registered with Base.metadata for migrations and ORM queries.
"""

from app.models.badge import Badge, user_badges
from app.models.borrow import BorrowRequest, BorrowTransaction
from app.models.impact import ImpactRecord
from app.models.issue import Issue, IssueUpdate
from app.models.item import Item
from app.models.notification import Notification
from app.models.points import GreenPoint
from app.models.user import User

__all__ = [
    "User",
    "Issue",
    "IssueUpdate",
    "Item",
    "BorrowRequest",
    "BorrowTransaction",
    "GreenPoint",
    "Badge",
    "user_badges",
    "Notification",
    "ImpactRecord",
]
