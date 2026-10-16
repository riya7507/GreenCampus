"""
ImpactRecord ORM Model
Aggregates quantifiable sustainability impact metrics across the campus community
for the live student and administrative dashboards.
"""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class ImpactRecord(Base):
    __tablename__ = "impact_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    issue_id = Column(Integer, ForeignKey("issues.id", ondelete="SET NULL"), nullable=True, index=True)

    # Environmental conservation metrics
    water_saved = Column(Float, default=0.0, nullable=False)  # in Litres
    energy_saved = Column(Float, default=0.0, nullable=False)  # in kWh
    waste_reduced = Column(Float, default=0.0, nullable=False)  # in kg

    # Circular economy metrics
    items_shared = Column(Integer, default=0, nullable=False)
    purchases_avoided = Column(Integer, default=0, nullable=False)

    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="impact_records")
    issue = relationship("Issue", back_populates="impact_record")

    def __repr__(self) -> str:
        return (
            f"<ImpactRecord id={self.id} user_id={self.user_id} issue_id={self.issue_id} "
            f"water={self.water_saved}L energy={self.energy_saved}kWh waste={self.waste_reduced}kg>"
        )
