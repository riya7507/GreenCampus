"""
Notification Domain Service
"""

from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
) -> Notification:
    """Creates a new in-app notification for a user."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        notification_type=notification_type,
        is_read=False,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
