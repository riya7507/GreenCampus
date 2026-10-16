"""
Badge ORM Model & user_badges Association Table
Manages student sustainability achievements and milestone recognitions.
"""

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base

# Many-to-Many Association Table linking Users to Badges earned
user_badges = Table(
    "user_badges",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("badge_id", Integer, ForeignKey("badges.id", ondelete="CASCADE"), primary_key=True),
    Column("earned_at", DateTime(timezone=True), server_default=func.now(), nullable=False),
)


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(String(255), nullable=False)
    icon = Column(String(100), nullable=False)  # e.g., 'eco-starter', 'water-guardian'
    points_required = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Many-to-Many relationship with User
    users = relationship("User", secondary=user_badges, back_populates="badges")

    def __repr__(self) -> str:
        return f"<Badge id={self.id} name='{self.name}' points_required={self.points_required}>"
