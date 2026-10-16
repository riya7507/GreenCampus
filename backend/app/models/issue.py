"""
Issue & IssueUpdate ORM Models
Represents ResourceCare reports for campus resource wastage (water, electricity, waste)
and maintains a full historical audit trail of updates and resolutions.
"""

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Issue(Base):
    __tablename__ = "issues"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reported_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    issue_type = Column(String(50), nullable=False)  # water | electricity | waste | other
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)
    status = Column(String(20), default="reported", nullable=False, index=True)  # reported | in_progress | resolved
    assigned_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    # Resource conservation metrics recorded upon resolution
    estimated_water_saved = Column(Float, default=0.0, nullable=False)  # in Litres
    estimated_energy_saved = Column(Float, default=0.0, nullable=False)  # in kWh
    estimated_waste_reduced = Column(Float, default=0.0, nullable=False)  # in kg

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    reporter = relationship("User", foreign_keys=[reported_by], back_populates="reported_issues")
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_issues")
    updates = relationship(
        "IssueUpdate",
        back_populates="issue",
        cascade="all, delete-orphan",
        order_by="IssueUpdate.created_at.desc()",
    )
    impact_record = relationship("ImpactRecord", back_populates="issue", uselist=False)

    def __repr__(self) -> str:
        return f"<Issue id={self.id} type={self.issue_type} status={self.status}>"


class IssueUpdate(Base):
    __tablename__ = "issue_updates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    issue_id = Column(Integer, ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, index=True)
    updated_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    issue = relationship("Issue", back_populates="updates")
    updater = relationship("User", back_populates="issue_updates")

    def __repr__(self) -> str:
        return f"<IssueUpdate id={self.id} issue_id={self.issue_id} status={self.old_status}->{self.new_status}>"
