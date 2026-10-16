"""
Item ORM Model
Represents items listed by students on GreenShare for sharing and borrowing,
reducing single-use purchases across campus.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=False, index=True)  # Academic | Electronics | Sports | Books | Other
    image_url = Column(String(500), nullable=True)
    condition = Column(String(50), default="good", nullable=False)  # new | like_new | good | fair
    availability_status = Column(
        String(20),
        default="available",
        nullable=False,
        index=True,
    )  # available | requested | borrowed | unavailable

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    owner = relationship("User", back_populates="owned_items")
    borrow_requests = relationship(
        "BorrowRequest",
        back_populates="item",
        cascade="all, delete-orphan",
    )
    borrow_transactions = relationship(
        "BorrowTransaction",
        back_populates="item",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<Item id={self.id} name='{self.name}' status={self.availability_status}>"
