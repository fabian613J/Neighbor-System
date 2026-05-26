# routers/neighborhood_items.py
# Endpoints: GET /neighborhood-items  – list all items (with optional category filter)
#            POST /neighborhood-items – create a new community item

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import NeighborhoodItem, Category

router = APIRouter(prefix="/neighborhood-items", tags=["Neighborhood Items"])


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class NeighborhoodItemCreate(BaseModel):
    category_id:     int            = Field(..., gt=0, description="ID of an existing category")
    name:            str            = Field(..., min_length=2, max_length=100)
    description:     Optional[str]  = Field(None, max_length=500)
    total_stock:     int            = Field(1, ge=1)
    available_stock: int            = Field(1, ge=0)
    condition:       Optional[str]  = Field("good", pattern="^(new|good|fair|poor)$")
    location_notes:  Optional[str]  = Field(None, max_length=200)
    is_available:    bool           = True


class NeighborhoodItemOut(BaseModel):
    item_id:         int
    category_id:     int
    category_name:   Optional[str]  = None
    name:            str
    description:     Optional[str]
    total_stock:     int
    available_stock: int
    condition:       Optional[str]
    location_notes:  Optional[str]
    is_available:    bool

    model_config = {"from_attributes": True}


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/", response_model=List[NeighborhoodItemOut])
def list_items(
    category_id:  Optional[int]  = Query(None, description="Filter by category ID"),
    is_available: Optional[bool] = Query(None, description="Filter by availability"),
    db: Session = Depends(get_db),
):
    """Return all community inventory items, with optional filters."""
    query = db.query(NeighborhoodItem)

    if category_id is not None:
        query = query.filter(NeighborhoodItem.category_id == category_id)
    if is_available is not None:
        query = query.filter(NeighborhoodItem.is_available == is_available)

    items = query.all()

    # Attach category name for convenience
    result = []
    for item in items:
        out = NeighborhoodItemOut.model_validate(item)
        out.category_name = item.category.name if item.category else None
        result.append(out)

    return result


@router.post("/", response_model=NeighborhoodItemOut, status_code=201)
def create_item(payload: NeighborhoodItemCreate, db: Session = Depends(get_db)):
    """Register a new item in the community inventory."""
    # Validate category exists
    category = db.query(Category).filter(Category.category_id == payload.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {payload.category_id} not found.")

    # available_stock cannot exceed total_stock
    if payload.available_stock > payload.total_stock:
        raise HTTPException(
            status_code=422,
            detail="available_stock cannot be greater than total_stock.",
        )

    new_item = NeighborhoodItem(**payload.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    out = NeighborhoodItemOut.model_validate(new_item)
    out.category_name = category.name
    return out
