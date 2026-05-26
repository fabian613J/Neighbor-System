# routers/categories.py
# Endpoints: GET /categories — list all active categories

from typing import List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Category

router = APIRouter(prefix="/categories", tags=["Categories"])


class CategoryOut(BaseModel):
    category_id: int
    name: str
    description: str | None
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    """Return all active categories."""
    return db.query(Category).filter(Category.is_active == True).all()
