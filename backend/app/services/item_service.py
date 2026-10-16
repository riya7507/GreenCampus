"""
GreenShare Item Domain Service
Manages item creation, catalog browsing, and filtering.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemCreateRequest
from app.services.points_service import award_green_points


def create_item_listing(
    db: Session,
    owner: User,
    data: ItemCreateRequest,
) -> Item:
    """Creates a new GreenShare listing and awards listing points (+15)."""
    item = Item(
        owner_id=owner.id,
        name=data.name,
        description=data.description,
        category=data.category,
        condition=data.condition,
        image_url=data.image_url,
        availability_status="available",
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    # Award Green Points for sharing resources
    award_green_points(
        db,
        user_id=owner.id,
        points=15,
        reason=f"Listed reusable item: {item.name}",
        reference_type="item_share",
        reference_id=item.id,
    )

    return item


def list_catalog_items(
    db: Session,
    category: Optional[str] = None,
    availability: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Item]:
    """Queries available items with optional search and category filters."""
    query = db.query(Item)

    if category and category.lower() != "all":
        query = query.filter(Item.category == category)

    if availability:
        query = query.filter(Item.availability_status == availability)
    else:
        # By default, show available and requested items in catalog
        query = query.filter(Item.availability_status.in_(["available", "requested"]))

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Item.name.ilike(search_term),
                Item.description.ilike(search_term),
            )
        )

    return query.order_by(Item.created_at.desc()).all()


def get_item_by_id(db: Session, item_id: int) -> Optional[Item]:
    """Retrieves an item by ID."""
    return db.query(Item).filter(Item.id == item_id).first()


def list_owner_items(db: Session, owner_id: int) -> List[Item]:
    """Lists all items listed by a specific student."""
    return db.query(Item).filter(Item.owner_id == owner_id).order_by(Item.created_at.desc()).all()
