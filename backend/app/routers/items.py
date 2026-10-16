"""
GreenShare Items API Router
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.item import Item
from app.models.user import User
from app.schemas.item import ItemCreateRequest, ItemResponse
from app.services.item_service import (
    create_item_listing,
    get_item_by_id,
    list_catalog_items,
    list_owner_items,
)

router = APIRouter(prefix="/items", tags=["GreenShare Items"])


def _format_item(item: Item) -> ItemResponse:
    return ItemResponse(
        id=item.id,
        owner_id=item.owner_id,
        owner_name=item.owner.full_name if item.owner else None,
        name=item.name,
        description=item.description,
        category=item.category,
        condition=item.condition,
        image_url=item.image_url,
        availability_status=item.availability_status,
        status=item.availability_status,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def add_new_item_listing(
    data: ItemCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Lists a new reusable item for student sharing."""
    item = create_item_listing(db, current_user, data)
    return _format_item(item)


@router.get("/", response_model=List[ItemResponse])
def get_catalog_items(
    category: Optional[str] = Query(None),
    availability: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Browses the GreenShare catalog with keyword search and category filters."""
    items = list_catalog_items(db, category, availability, search)
    return [_format_item(i) for i in items]


@router.get("/me", response_model=List[ItemResponse])
def get_my_listed_items(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all items listed by the logged-in student."""
    items = list_owner_items(db, current_user.id)
    return [_format_item(i) for i in items]


@router.get("/{id}", response_model=ItemResponse)
def get_single_item(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves details of a specific item."""
    item = get_item_by_id(db, id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found.")
    return _format_item(item)
