"""
GreenPoint ORM Model
Maintains an immutable ledger of points earned by users for verified sustainable actions
such as reporting wastage, sharing items, or returning borrowed supplies.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class GreenPoint(Base):
    __tablename__ = "green_points"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    points = Column(Integer, nullable=False)
    reason = Column(String(150), nullable=False)
    reference_type = Column(
        String(50),
        nullable=True,
        index=True,
    )  # issue | item_share | borrow_return | avoided_purchase
    reference_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="green_points")

    def __repr__(self) -> str:
        return f"<GreenPoint id={self.id} user_id={self.user_id} points={self.points} reason='{self.reason}'>"
